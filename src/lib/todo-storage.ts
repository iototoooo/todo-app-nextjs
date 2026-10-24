export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

export type TodoState = {
  todos: Todo[];
  /** 直近の読み込み・保存で起きた問題。問題がなければ null */
  error: "load" | "save" | null;
};

export const STORAGE_KEY = "todo-app:todos:v1";
export const MAX_TITLE_LENGTH = 100;

let state: TodoState | null = null;
const listeners = new Set<() => void>();

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.completed === "boolean" &&
    typeof v.createdAt === "number"
  );
}

function parse(raw: string | null): TodoState {
  if (raw === null) return { todos: [], error: null };
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return { todos: [], error: "load" };
    const todos = data.filter(isTodo);
    return { todos, error: todos.length === data.length ? null : "load" };
  } catch {
    return { todos: [], error: "load" };
  }
}

function readStorage(): TodoState {
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // プライベートブラウズ等で localStorage 自体が使えない場合
    return { todos: [], error: "load" };
  }
}

function ensureLoaded(): TodoState {
  if (state === null) state = readStorage();
  return state;
}

function emit() {
  for (const listener of listeners) listener();
}

// 別タブでの変更を反映する
function handleStorage(event: StorageEvent) {
  if (event.storageArea !== window.localStorage) return;
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  state = readStorage();
  emit();
}

export function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getSnapshot(): TodoState | null {
  return ensureLoaded();
}

/** サーバー描画時は localStorage が無いので「読み込み中」を表す null を返す */
export function getServerSnapshot(): TodoState | null {
  return null;
}

export function updateTodos(updater: (todos: Todo[]) => Todo[]) {
  const todos = updater(ensureLoaded().todos);
  let error: TodoState["error"] = null;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    error = "save";
  }
  state = { todos, error };
  emit();
}

function createId() {
  // crypto.randomUUID は https / localhost 以外（スマホから LAN の IP で開く等）では使えない
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createTodo(title: string): Todo {
  return { id: createId(), title, completed: false, createdAt: Date.now() };
}

export function countChars(text: string) {
  return Array.from(text).length;
}

/** 入力内容に問題があればエラーメッセージを、なければ null を返す */
export function validateTitle(input: string): string | null {
  const title = input.trim();
  if (title === "") return "タスクの内容を入力してください。";
  const length = countChars(title);
  if (length > MAX_TITLE_LENGTH) {
    return `${MAX_TITLE_LENGTH}文字以内で入力してください（現在 ${length} 文字）。`;
  }
  return null;
}

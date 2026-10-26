// 検索・絞り込み・並び替え。保存されている配列の順番（登録順）は変えず、表示用の配列だけを作る。
import { getDueStatus } from "./todo-date";
import type { Priority, Todo } from "./todo-storage";

export type StatusFilter = "all" | "active" | "completed";
export type PriorityFilter = "all" | Priority;
export type DueFilter = "all" | "overdue" | "today" | "none";
export type SortOrder = "created" | "priority" | "due";

export type ViewOptions = {
  query: string;
  status: StatusFilter;
  priority: PriorityFilter;
  due: DueFilter;
  sort: SortOrder;
};

export const DEFAULT_VIEW: ViewOptions = {
  query: "",
  status: "all",
  priority: "all",
  due: "all",
  sort: "created",
};

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** 並び順以外の条件が1つでも指定されているか */
export function isFiltering(view: ViewOptions) {
  return (
    view.query.trim() !== "" ||
    view.status !== DEFAULT_VIEW.status ||
    view.priority !== DEFAULT_VIEW.priority ||
    view.due !== DEFAULT_VIEW.due
  );
}

// 全角・半角や大文字・小文字の違いを無視して検索する
function normalize(text: string) {
  return text.normalize("NFKC").toLowerCase();
}

export function matchesView(todo: Todo, view: ViewOptions, today: string) {
  const query = normalize(view.query.trim());
  if (query && !normalize(todo.title).includes(query)) return false;

  if (view.status === "active" && todo.completed) return false;
  if (view.status === "completed" && !todo.completed) return false;

  if (view.priority !== "all" && todo.priority !== view.priority) return false;

  if (view.due !== "all") {
    const status = getDueStatus(todo, today).kind;
    if (view.due === "overdue" && status !== "overdue") return false;
    if (view.due === "today" && status !== "today") return false;
    if (view.due === "none" && status !== "none") return false;
  }
  return true;
}

/** 条件に合うタスクを表示順に並べる（Array.prototype.sort は安定ソートなので、同順位は登録順のまま） */
export function applyView(todos: Todo[], view: ViewOptions, today: string) {
  const visible = todos.filter((todo) => matchesView(todo, view, today));
  if (view.sort === "priority") {
    visible.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  } else if (view.sort === "due") {
    // 期限が近い順。期限なしは最後
    visible.sort((a, b) => {
      if (a.dueDate === b.dueDate) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    });
  }
  return visible;
}

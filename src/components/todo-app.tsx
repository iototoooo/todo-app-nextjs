"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  createTodo,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateTodos,
  type Todo,
} from "@/lib/todo-storage";
import { TodoForm } from "./todo-form";
import { TodoItem } from "./todo-item";
import { UndoToast } from "./undo-toast";

type Deleted = { todo: Todo; index: number; key: number };
type FocusTarget = { kind: "input" } | { kind: "item"; id: string };

export function TodoApp() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [lastDeleted, setLastDeleted] = useState<Deleted | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxRefs = useRef(new Map<string, HTMLInputElement>());
  // 削除・取り消しのあと、描画が終わってからフォーカスを移す
  const pendingFocus = useRef<FocusTarget | null>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target.kind === "input") inputRef.current?.focus();
    else checkboxRefs.current.get(target.id)?.focus();
  });

  const todos = state?.todos ?? [];
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  function handleAdd(title: string) {
    updateTodos((current) => [createTodo(title), ...current]);
    setAnnouncement(`「${title}」を追加しました。`);
  }

  function handleToggle(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    updateTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    setAnnouncement(
      todo.completed
        ? `「${todo.title}」を未完了に戻しました。`
        : `「${todo.title}」を完了にしました。`,
    );
  }

  function handleDelete(id: string) {
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return;
    const todo = todos[index];
    const neighbor = todos[index + 1] ?? todos[index - 1];
    pendingFocus.current = neighbor ? { kind: "item", id: neighbor.id } : { kind: "input" };

    updateTodos((current) => current.filter((t) => t.id !== id));
    setLastDeleted({ todo, index, key: Date.now() });
    setAnnouncement(
      `「${todo.title}」を削除しました。画面下の「元に戻す」ボタンで取り消せます。`,
    );
  }

  const handleUndo = useCallback(() => {
    if (!lastDeleted) return;
    const { todo, index } = lastDeleted;
    updateTodos((current) => {
      if (current.some((t) => t.id === todo.id)) return current;
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, todo);
      return next;
    });
    pendingFocus.current = { kind: "item", id: todo.id };
    setLastDeleted(null);
    setAnnouncement(`「${todo.title}」を元に戻しました。`);
  }, [lastDeleted]);

  const dismissToast = useCallback(() => setLastDeleted(null), []);

  // 取り消しは Ctrl+Z（Mac は ⌘+Z）でも可能。文字入力中は通常の取り消しを優先する
  useEffect(() => {
    if (!lastDeleted) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "z" || !(event.ctrlKey || event.metaKey) || event.shiftKey) {
        return;
      }
      const el = event.target;
      const typing =
        (el instanceof HTMLInputElement && el.type === "text") ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      event.preventDefault();
      handleUndo();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lastDeleted, handleUndo]);

  const registerCheckbox = useCallback(
    (id: string) => (el: HTMLInputElement | null) => {
      if (!el) return;
      checkboxRefs.current.set(id, el);
      return () => {
        checkboxRefs.current.delete(id);
      };
    },
    [],
  );

  return (
    <>
      <section
        aria-label="タスクの追加"
        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800"
      >
        <TodoForm onAdd={handleAdd} inputRef={inputRef} />
      </section>

      {state?.error === "save" && (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-base text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          <strong className="font-bold">ブラウザに保存できませんでした。</strong>
          プライベートブラウズ中や保存容量の不足が考えられます。このままページを閉じると、変更が失われます。
        </p>
      )}
      {state?.error === "load" && (
        <p
          role="alert"
          className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-base text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          <strong className="font-bold">保存されていたデータの一部を読み込めませんでした。</strong>
          読み込めた分だけを表示しています。
        </p>
      )}

      <section aria-labelledby="list-heading" aria-busy={state === null} className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="list-heading" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            タスク一覧
          </h2>
          {state !== null && total > 0 && (
            <p className="text-base text-slate-700 dark:text-slate-300">
              完了率 <span className="font-bold">{percent}%</span>
            </p>
          )}
        </div>

        <dl className="grid grid-cols-3 gap-3 text-center">
          <Stat label="全タスク" value={state === null ? "–" : total} />
          <Stat label="完了" value={state === null ? "–" : completed} />
          <Stat label="残り" value={state === null ? "–" : remaining} />
        </dl>

        {state !== null && total > 0 && (
          <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-700 transition-[width] duration-300 motion-reduce:transition-none dark:bg-blue-400"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {state === null ? (
          <p className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-base text-slate-600 dark:border-slate-700 dark:text-slate-400">
            読み込み中…
          </p>
        ) : total === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              まだタスクがありません
            </p>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
              上の入力欄にやることを書いて「追加」を押しましょう。
            </p>
          </div>
        ) : (
          <>
            {remaining === 0 && (
              <p className="rounded-2xl bg-green-50 p-4 text-center text-base font-bold text-green-800 dark:bg-green-950 dark:text-green-200">
                すべてのタスクが完了しました。おつかれさまでした！
              </p>
            )}
            <ul className="space-y-3">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  checkboxRef={registerCheckbox(todo.id)}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </>
        )}
      </section>

      {/* スクリーンリーダー向けに操作結果を読み上げる */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {lastDeleted && (
          <UndoToast
            key={lastDeleted.key}
            title={lastDeleted.todo.title}
            onUndo={handleUndo}
            onDismiss={dismissToast}
          />
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white px-2 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-100">
        {value}
        {typeof value === "number" && <span className="ml-0.5 text-sm font-normal">件</span>}
      </dd>
    </div>
  );
}

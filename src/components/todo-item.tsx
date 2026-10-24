import type { Ref } from "react";
import type { Todo } from "@/lib/todo-storage";

type Props = {
  todo: Todo;
  checkboxRef: Ref<HTMLInputElement>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, checkboxRef, onToggle, onDelete }: Props) {
  const checkboxId = `todo-${todo.id}`;

  return (
    <li
      className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-2 ${
        todo.completed
          ? "border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <input
        ref={checkboxRef}
        id={checkboxId}
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="size-6 shrink-0 cursor-pointer accent-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 dark:accent-blue-400"
      />
      {/* ラベル全体をタップ領域にして、チェックを押しやすくする */}
      <label
        htmlFor={checkboxId}
        className={`min-w-0 flex-1 cursor-pointer py-2 text-lg break-words ${
          todo.completed
            ? "text-slate-600 line-through dark:text-slate-400"
            : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {todo.title}
      </label>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`「${todo.title}」を削除`}
        className="min-h-11 min-w-16 shrink-0 rounded-xl border-2 border-red-200 px-3 text-base font-bold text-red-700 hover:border-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/40 dark:border-red-900 dark:text-red-400 dark:hover:border-red-400 dark:hover:bg-red-950"
      >
        削除
      </button>
    </li>
  );
}

import { useId, useState, type Ref } from "react";
import { getDueStatus } from "@/lib/todo-date";
import type { Priority, Todo } from "@/lib/todo-storage";
import { DueDateField } from "./due-date-field";
import { PriorityPicker } from "./priority-picker";
import { DueBadge, PriorityBadge } from "./todo-badges";

type Props = {
  todo: Todo;
  /** 利用者のローカル日付（YYYY-MM-DD） */
  today: string;
  checkboxRef: Ref<HTMLInputElement>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeDueDate: (id: string, dueDate: string | null) => void;
  onChangePriority: (id: string, priority: Priority) => void;
};

export function TodoItem({
  todo,
  today,
  checkboxRef,
  onToggle,
  onDelete,
  onChangeDueDate,
  onChangePriority,
}: Props) {
  const checkboxId = `todo-${todo.id}`;
  const panelId = useId();
  const [editing, setEditing] = useState(false);
  const dueStatus = getDueStatus(todo, today);
  const overdue = dueStatus.kind === "overdue";

  return (
    <li
      className={`rounded-2xl border-2 px-4 py-2 ${
        todo.completed
          ? "border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60"
          : overdue
            ? "border-red-300 bg-white dark:border-red-800 dark:bg-slate-900"
            : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center gap-4">
        <input
          ref={checkboxRef}
          id={checkboxId}
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-describedby={`${checkboxId}-meta`}
          className="size-6 shrink-0 cursor-pointer accent-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 dark:accent-blue-400"
        />
        <div className="min-w-0 flex-1">
          {/* ラベル全体をタップ領域にして、チェックを押しやすくする */}
          <label
            htmlFor={checkboxId}
            className={`block cursor-pointer pt-2 pb-1 text-lg break-words ${
              todo.completed
                ? "text-slate-600 line-through dark:text-slate-400"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {todo.title}
          </label>
          <p id={`${checkboxId}-meta`} className="flex flex-wrap gap-1.5 pb-2">
            <PriorityBadge priority={todo.priority} />
            <DueBadge dueDate={todo.dueDate} status={dueStatus} />
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          aria-label={`「${todo.title}」を削除`}
          className="min-h-11 min-w-16 shrink-0 rounded-xl border-2 border-red-200 px-3 text-base font-bold text-red-700 hover:border-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/40 dark:border-red-900 dark:text-red-400 dark:hover:border-red-400 dark:hover:bg-red-950"
        >
          削除
        </button>
      </div>

      <div className="pb-1 pl-10">
        <button
          type="button"
          onClick={() => setEditing((open) => !open)}
          aria-expanded={editing}
          aria-controls={editing ? panelId : undefined}
          aria-label={`「${todo.title}」の期限・優先度を${editing ? "閉じる" : "変更"}`}
          className="min-h-11 rounded-xl px-2 text-base font-bold text-blue-700 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 dark:text-blue-400"
        >
          <span aria-hidden="true">{editing ? "▲ " : "▼ "}</span>
          期限・優先度を{editing ? "閉じる" : "変更"}
        </button>
      </div>

      {editing && (
        <div
          id={panelId}
          className="mb-2 grid gap-4 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 dark:bg-slate-800/60"
        >
          <DueDateField
            label="期限"
            value={todo.dueDate}
            onChange={(dueDate) => onChangeDueDate(todo.id, dueDate)}
          />
          <PriorityPicker
            value={todo.priority}
            onChange={(priority) => onChangePriority(todo.id, priority)}
          />
        </div>
      )}
    </li>
  );
}

import { formatDateKey, type DueStatus } from "@/lib/todo-date";
import { PRIORITY_LABELS, type Priority } from "@/lib/todo-storage";

const BADGE = "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-sm font-bold ring-1";

const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-red-50 text-red-800 ring-red-300 dark:bg-red-950 dark:text-red-200 dark:ring-red-800",
  medium:
    "bg-amber-50 text-amber-900 ring-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-700",
  low: "bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`${BADGE} ${PRIORITY_CLASS[priority]}`}>
      優先度：{PRIORITY_LABELS[priority]}
    </span>
  );
}

export function DueBadge({ dueDate, status }: { dueDate: string | null; status: DueStatus }) {
  if (dueDate === null || status.kind === "none") return null;
  const date = formatDateKey(dueDate);

  switch (status.kind) {
    case "overdue":
      return (
        <span className={`${BADGE} bg-red-700 text-white ring-red-700 dark:bg-red-400 dark:text-slate-950 dark:ring-red-400`}>
          <span aria-hidden="true">⚠</span>期限切れ（{date}・{status.days}日超過）
        </span>
      );
    case "today":
      return (
        <span className={`${BADGE} bg-orange-100 text-orange-900 ring-orange-400 dark:bg-orange-950 dark:text-orange-100 dark:ring-orange-600`}>
          <span aria-hidden="true">⏰</span>今日まで
        </span>
      );
    case "soon":
      return (
        <span className={`${BADGE} bg-yellow-50 text-yellow-900 ring-yellow-400 dark:bg-yellow-950 dark:text-yellow-100 dark:ring-yellow-700`}>
          {status.days === 1 ? "明日まで" : `あと${status.days}日`}（{date}）
        </span>
      );
    case "later":
      return (
        <span className={`${BADGE} bg-white text-slate-700 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-600`}>
          期限：{date}
        </span>
      );
    case "done":
      return (
        <span className={`${BADGE} bg-transparent text-slate-600 ring-slate-300 dark:text-slate-400 dark:ring-slate-700`}>
          期限：{date}
        </span>
      );
  }
}

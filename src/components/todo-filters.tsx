import { useId, type RefObject } from "react";
import { PRIORITY_LABELS } from "@/lib/todo-storage";
import type {
  DueFilter,
  PriorityFilter,
  SortOrder,
  StatusFilter,
  ViewOptions,
} from "@/lib/todo-view";
import { SegmentedRadio } from "./segmented-radio";

const STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了" },
] as const satisfies readonly { value: StatusFilter; label: string }[];

const PRIORITY_OPTIONS: readonly { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "high", label: PRIORITY_LABELS.high },
  { value: "medium", label: PRIORITY_LABELS.medium },
  { value: "low", label: PRIORITY_LABELS.low },
];

const DUE_OPTIONS: readonly { value: DueFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "overdue", label: "期限切れ" },
  { value: "today", label: "今日まで" },
  { value: "none", label: "期限なし" },
];

const SORT_OPTIONS: readonly { value: SortOrder; label: string }[] = [
  { value: "created", label: "追加が新しい順" },
  { value: "priority", label: "優先度が高い順" },
  { value: "due", label: "期限が近い順" },
];

type Props = {
  view: ViewOptions;
  onChange: (patch: Partial<ViewOptions>) => void;
  onReset: () => void;
  filtering: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
};

export function TodoFilters({ view, onChange, onReset, filtering, searchRef }: Props) {
  const searchId = useId();
  return (
    <section
      aria-label="検索・絞り込み"
      className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <div>
        <label
          htmlFor={searchId}
          className="mb-1.5 block text-base font-bold text-slate-800 dark:text-slate-100"
        >
          キーワードで検索
        </label>
        <input
          ref={searchRef}
          id={searchId}
          type="search"
          value={view.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="タスク名の一部を入力"
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-600/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
      </div>

      <SegmentedRadio
        legend="状態"
        value={view.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Select
          label="優先度"
          value={view.priority}
          options={PRIORITY_OPTIONS}
          onChange={(priority) => onChange({ priority })}
        />
        <Select
          label="期限"
          value={view.due}
          options={DUE_OPTIONS}
          onChange={(due) => onChange({ due })}
        />
        <div className="col-span-2 sm:col-span-1">
          <Select
            label="並び順"
            value={view.sort}
            options={SORT_OPTIONS}
            onChange={(sort) => onChange({ sort })}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={!filtering}
        className="min-h-11 w-full rounded-xl border-2 border-slate-300 px-4 text-base font-bold text-slate-800 hover:border-slate-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-400"
      >
        検索・絞り込みを解除
      </button>
    </section>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-base font-bold text-slate-800 dark:text-slate-100"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-600/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

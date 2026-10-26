import { useId } from "react";
import { isDateKey } from "@/lib/todo-date";

type Props = {
  /** YYYY-MM-DD。未設定は null */
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
};

/** 期限の入力欄。ブラウザ標準のカレンダーで日付を選べる */
export function DueDateField({ value, onChange, label = "期限（任意）" }: Props) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-base font-bold text-slate-800 dark:text-slate-100"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="date"
          value={value ?? ""}
          onChange={(event) => {
            const next = event.target.value;
            onChange(isDateKey(next) ? next : null);
          }}
          className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-base text-slate-900 [color-scheme:light] focus:outline-none focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-600/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
        />
        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="min-h-11 shrink-0 rounded-xl border-2 border-slate-300 px-3 text-base font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
          >
            期限なし
          </button>
        )}
      </div>
    </div>
  );
}

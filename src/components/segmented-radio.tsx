import { useId } from "react";

type Option<T extends string> = {
  value: T;
  label: string;
  /** 選択中の見た目（優先度ごとの色など）。省略時は青 */
  checkedClassName?: string;
};

type Props<T extends string> = {
  legend: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

const DEFAULT_CHECKED =
  "has-checked:border-blue-700 has-checked:bg-blue-700 has-checked:text-white dark:has-checked:border-blue-400 dark:has-checked:bg-blue-400 dark:has-checked:text-slate-950";

/** ラジオボタンを横並びのボタン風に表示する（矢印キーで選択を移動できる） */
export function SegmentedRadio<T extends string>({ legend, value, options, onChange }: Props<T>) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-base font-bold text-slate-800 dark:text-slate-100">
        {legend}
      </legend>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-2 text-base font-bold text-slate-800 has-focus-visible:ring-4 has-focus-visible:ring-blue-600/40 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 ${
              option.checkedClassName ?? DEFAULT_CHECKED
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/todo-storage";
import { SegmentedRadio } from "./segmented-radio";

// 色だけに頼らず「高・中・低」の文字でも区別できるようにする
const CHECKED_CLASS: Record<Priority, string> = {
  high: "has-checked:border-red-700 has-checked:bg-red-700 has-checked:text-white dark:has-checked:border-red-400 dark:has-checked:bg-red-400 dark:has-checked:text-slate-950",
  medium:
    "has-checked:border-amber-600 has-checked:bg-amber-500 has-checked:text-slate-950 dark:has-checked:border-amber-400 dark:has-checked:bg-amber-400",
  low: "has-checked:border-slate-600 has-checked:bg-slate-600 has-checked:text-white dark:has-checked:border-slate-300 dark:has-checked:bg-slate-300 dark:has-checked:text-slate-950",
};

const OPTIONS = PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_LABELS[priority],
  checkedClassName: CHECKED_CLASS[priority],
}));

type Props = {
  value: Priority;
  onChange: (priority: Priority) => void;
};

export function PriorityPicker({ value, onChange }: Props) {
  return <SegmentedRadio legend="優先度" value={value} options={OPTIONS} onChange={onChange} />;
}

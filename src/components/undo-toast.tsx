import { useEffect, useState } from "react";

export const UNDO_TIMEOUT_MS = 10_000;

type Props = {
  title: string;
  onUndo: () => void;
  onDismiss: () => void;
};

export function UndoToast({ title, onUndo, onDismiss }: Props) {
  // マウスを乗せている間・フォーカス中は自動で消えないようにする
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(onDismiss, UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [paused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onDismiss();
      }}
      className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl dark:bg-slate-100 dark:text-slate-900"
    >
      <p className="min-w-0 flex-1 text-base">
        <span className="line-clamp-2 break-words">「{title}」を削除しました</span>
      </p>
      <button
        type="button"
        onClick={onUndo}
        className="min-h-11 shrink-0 rounded-xl bg-white px-4 text-base font-bold text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-700"
      >
        元に戻す
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="お知らせを閉じる"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl leading-none hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 dark:hover:bg-slate-900/10"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

import { useSyncExternalStore } from "react";
import { toDateKey } from "./todo-date";

// 開いたまま日付が変わっても「今日まで」「期限切れ」の表示が更新されるよう、
// 1分ごとと画面に戻ったときに今日の日付を確認する
function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getSnapshot() {
  return toDateKey(new Date());
}

/** サーバー描画時は利用者のローカル日付がわからないので null を返す */
function getServerSnapshot() {
  return null;
}

/** 利用者のローカル日付（YYYY-MM-DD） */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

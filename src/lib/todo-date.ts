// 期限の日付は「利用者のローカル日付」を YYYY-MM-DD の文字列で扱う。
// 時刻やタイムゾーンを持たせないことで、端末の時差による日付のずれを防ぐ。

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 期限が近いとみなす日数（今日を含まない） */
export const SOON_DAYS = 3;

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Date を利用者のローカル日付（YYYY-MM-DD）に変換する */
export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcTime(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** from から to までの日数（to が後なら正） */
export function daysBetween(from: string, to: string) {
  return Math.round((toUtcTime(to) - toUtcTime(from)) / DAY_MS);
}

/** 例: 10月26日（月） */
export function formatDateKey(key: string) {
  const date = new Date(toUtcTime(key));
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日（${WEEKDAYS[date.getUTCDay()]}）`;
}

export type DueStatus =
  | { kind: "none" }
  | { kind: "done" }
  | { kind: "overdue"; days: number }
  | { kind: "today" }
  | { kind: "soon"; days: number }
  | { kind: "later"; days: number };

/** 期限の状態。完了済みのタスクは期限切れとして扱わない */
export function getDueStatus(
  todo: { dueDate: string | null; completed: boolean },
  today: string,
): DueStatus {
  if (todo.dueDate === null) return { kind: "none" };
  if (todo.completed) return { kind: "done" };
  const days = daysBetween(today, todo.dueDate);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days === 0) return { kind: "today" };
  if (days <= SOON_DAYS) return { kind: "soon", days };
  return { kind: "later", days };
}

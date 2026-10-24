import { useState, type FormEvent, type RefObject } from "react";
import {
  MAX_TITLE_LENGTH,
  countChars,
  validateTitle,
} from "@/lib/todo-storage";

type Props = {
  onAdd: (title: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function TodoForm({ onAdd, inputRef }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const length = countChars(value.trim());
  const tooLong = length > MAX_TITLE_LENGTH;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateTitle(value);
    if (message) {
      setError(message);
      inputRef.current?.focus();
      return;
    }
    onAdd(value.trim());
    setValue("");
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <label
        htmlFor="todo-input"
        className="block text-base font-bold text-slate-800 dark:text-slate-100"
      >
        新しいタスク
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          id="todo-input"
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            // エラー表示中は、直したらすぐ消えるように再検証する
            if (error) setError(validateTitle(event.target.value));
          }}
          placeholder="例：牛乳を買う"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "todo-input-error todo-input-hint" : "todo-input-hint"}
          className={`min-h-12 w-full flex-1 rounded-xl border-2 bg-white px-4 text-lg text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:ring-4 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 ${
            error
              ? "border-red-600 focus-visible:ring-red-600/30 dark:border-red-400"
              : "border-slate-300 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 dark:border-slate-600"
          }`}
        />
        <button
          type="submit"
          className="min-h-12 shrink-0 rounded-xl bg-blue-700 px-6 text-lg font-bold text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40 active:bg-blue-900 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
        >
          追加
        </button>
      </div>
      {error && (
        <p
          id="todo-input-error"
          role="alert"
          className="flex items-start gap-1.5 text-base font-bold text-red-700 dark:text-red-400"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
      <p
        id="todo-input-hint"
        className={`text-sm ${
          tooLong
            ? "font-bold text-red-700 dark:text-red-400"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {length} / {MAX_TITLE_LENGTH} 文字・Enter キーでも追加できます
      </p>
    </form>
  );
}

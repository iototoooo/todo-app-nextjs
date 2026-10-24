import { TodoApp } from "@/components/todo-app";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 pt-8 pb-36 sm:pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">ToDoリスト</h1>
        <p className="text-base text-slate-700 dark:text-slate-300">
          やることを追加して、終わったらチェックを入れましょう。
          データはこのブラウザに保存され、閉じても残ります。
        </p>
      </header>
      <TodoApp />
    </main>
  );
}

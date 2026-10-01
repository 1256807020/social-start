// ============================================================================
// Jotai 练习页（客户端组件）
// ----------------------------------------------------------------------------
// 演示三种“读/写原子”的 hook：
//   - useAtom(atom)        → 读写（返回 [value, setValue]）
//   - useAtomValue(atom)   → 只读（只要值）
//   - useSetAtom(atom)     → 只写（只要 setter）
// 还演示 Provider：给本页圈一个独立的 store（避免 SSR 下跨请求串状态）。
// ============================================================================
'use client';

import { useAtom, useAtomValue, useSetAtom, Provider } from 'jotai';
import {
  inputAtom,
  todosAtom,
  remainingAtom,
  addTodoAtom,
  toggleTodoAtom,
  removeTodoAtom,
} from '@/lib/jotai-store';

export default function JotaiPage() {
  // 输入框：读写
  const [input, setInput] = useAtom(inputAtom);
  // 列表 / 剩余数：只读
  const todos = useAtomValue(todosAtom);
  const remaining = useAtomValue(remainingAtom);
  // 动作：只写
  const addTodo = useSetAtom(addTodoAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const removeTodo = useSetAtom(removeTodoAtom);

  return (
    <Provider>
      <main className="p-8 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Jotai 原子状态练习</h1>
        <p className="text-muted-foreground">剩余 {remaining} 项未完成</p>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
            placeholder="输入待办，回车添加"
            className="flex-1 rounded border border-input px-2 py-1 bg-background"
          />
          <button
            onClick={() => addTodo()}
            className="rounded bg-primary text-primary-foreground px-3 py-1"
          >
            添加
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between border border-border rounded px-3 py-2"
            >
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
                <span className={t.done ? 'line-through text-muted-foreground' : ''}>{t.text}</span>
              </label>
              <button onClick={() => removeTodo(t.id)} className="text-destructive text-sm">
                删除
              </button>
            </li>
          ))}
        </ul>
      </main>
    </Provider>
  );
}

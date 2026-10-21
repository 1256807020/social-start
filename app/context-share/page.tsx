'use client'

// 【context-share · 演示页】 app/context-share/page.tsx
// 学习模式：👉 注意下面四个组件 AddTodo / TodoStats / TodoList / ItemActions 彼此独立、互不传 props，
// 却通过 useTodo() 共享同一份状态——这就是 Context 相比 prop drilling 的价值。
import { useState } from 'react'
import { TodoProvider, useTodo } from './todo-store'

// 顶层表单：只拿 addTodo，不接收任何 props —— 这就是"免 prop drilling"
function AddTodo() {
  const { addTodo } = useTodo()
  const [title, setTitle] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await addTodo(title.trim())
    setTitle('')
  }
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="flex-1 rounded border px-2 py-1"
        placeholder="新待办标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
        新增
      </button>
    </form>
  )
}

// 统计：只读 store，不接收任何 props
function TodoStats() {
  const { state } = useTodo()
  const total = state.list.length
  const done = state.list.filter((t) => t.done).length
  return (
    <p className="text-sm text-gray-500">
      共 {total} 条，已完成 {done} 条
    </p>
  )
}

// 深层子组件：嵌在 TodoItem 里，仍只靠 useTodo() 拿到 removeTodo——证明任意深度免 prop drilling
function ItemActions({ id }: { id: number }) {
  const { removeTodo } = useTodo()
  return (
    <button className="text-sm text-red-600" onClick={() => removeTodo(id)}>
      删
    </button>
  )
}

function TodoItem({ id, title, done }: { id: number; title: string; done: boolean }) {
  const { toggleTodo } = useTodo()
  return (
    <li className="flex items-center gap-2 border-b py-1">
      <input type="checkbox" checked={done} onChange={() => toggleTodo(id)} />
      <span className={`flex-1 ${done ? 'line-through text-gray-400' : ''}`}>
        #{id} {title}
      </span>
      <ItemActions id={id} />
    </li>
  )
}

// 列表：只读 store，依据 loading / error / 空 三态渲染
function TodoList() {
  const { state } = useTodo()
  if (state.loading) return <p className="text-sm text-gray-400">加载中…</p>
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>
  if (state.list.length === 0)
    return <p className="text-sm text-gray-400">还没有待办，先加一条吧</p>
  return (
    <ul className="space-y-2">
      {state.list.map((t) => (
        <TodoItem key={t.id} id={t.id} title={t.title} done={t.done} />
      ))}
    </ul>
  )
}

// 🔧 固定写法：入口组件用 <TodoProvider> 把整棵子树包起来，store 就对全部后代可用；
// 页面本身不含任何状态逻辑，只负责"摆组件 + 包 Provider"
export default function ContextSharePage() {
  return (
    <TodoProvider>
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Context + useReducer 全局 store · /context-share</h1>
        <p className="text-sm text-gray-500">
          路由 <code>/context-share</code> ｜ 状态在顶层 Provider 注入，AddTodo / Stats /
          List / ItemActions 四个组件互不传 props 却共享同一份状态（数据走 /api/todo 持久化）
        </p>
        <AddTodo />
        <TodoStats />
        <TodoList />
      </main>
    </TodoProvider>
  )
}

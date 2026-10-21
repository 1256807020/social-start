'use client'

// 【context-share · 演示页】 app/context-share/page.tsx
// 学习模式：👉 注意下面四个组件 AddTodo / TodoStats / TodoList / ItemActions 彼此独立、互不传 props，
// 却通过 useTodo() 共享同一份状态——这就是 Context 相比 prop drilling 的价值。
// 文末 <details> 有 React / Vue2 / Vue3 三向对照（全局状态 / 跨组件共享篇）。
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

        <details className="mt-6 rounded border p-3 text-sm">
          <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（全局状态 / 跨组件共享）</summary>
          <table className="mt-2 w-full border-collapse text-left">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1">维度</th>
                <th className="px-2 py-1">React</th>
                <th className="px-2 py-1">Vue2</th>
                <th className="px-2 py-1">Vue3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="px-2 py-1">跨组件共享状态</td><td className="px-2 py-1">Context（createContext + &lt;Provider&gt; + useContext）+ useReducer 做 store</td><td className="px-2 py-1">无内建 DI；靠 Vuex（官方）或 provide/inject（默认非响应式）</td><td className="px-2 py-1">provide / inject（provide 一个 ref/reactive 即响应式）；或 Pinia（官方推荐）</td></tr>
              <tr className="border-b"><td className="px-2 py-1">状态机 / store</td><td className="px-2 py-1">useReducer(reducer, init) → [state, dispatch]；reducer 纯函数（无副作用）</td><td className="px-2 py-1">Vuex mutations(同步)+actions(异步) / data()+methods</td><td className="px-2 py-1">Pinia defineStore(&#123; state, getters, actions &#125;)；actions 可 async 直改</td></tr>
              <tr className="border-b"><td className="px-2 py-1">免 prop drilling</td><td className="px-2 py-1">useContext 任意深度直取，无需逐层传 props</td><td className="px-2 py-1">inject 同理（但默认非响应式，要注意）</td><td className="px-2 py-1">inject 同理（响应式需 provide ref/reactive）</td></tr>
              <tr className="border-b"><td className="px-2 py-1">消费端写法</td><td className="px-2 py-1">自定义 hook useTodo() 包 useContext，返回 state + 操作函数</td><td className="px-2 py-1">this.$store.dispatch / inject('key')</td><td className="px-2 py-1">useXxxStore() / inject('key')</td></tr>
              <tr className="border-b"><td className="px-2 py-1">忘了「提供方」</td><td className="px-2 py-1">useContext 初始 null + 抛错（本例 useTodo 抛错，及早暴露）</td><td className="px-2 py-1">无内建；inject 拿不到易静默</td><td className="px-2 py-1">inject(key, defaultValue) 给默认值，忘了 provide 不抛错</td></tr>
              <tr className="border-b"><td className="px-2 py-1">响应式 / 重渲染</td><td className="px-2 py-1">Context 值变→消费者重渲染；value 内联对象→每次新引用→全重渲染（性能敏感用 useMemo）</td><td className="px-2 py-1">provide/inject 默认非响应式，provide 普通值改了 inject 不更新</td><td className="px-2 py-1">provide 一个 ref/reactive 即响应式</td></tr>
            </tbody>
          </table>
          <p className="mt-2 text-gray-500">📝 小结：React 没有「内置 store」，轻量全局状态 = Context(注入) + useReducer(状态机)，是 Vuex/Pinia 的「手写平替」；真做服务端状态用 React Query/SWR。Vue2 无内建 DI，跨组件共享经典靠 Vuex；Vue3 用 provide/inject 或 Pinia。三者要解决的工程问题一致（状态声明→派生→监听→重渲染），只是 API 与「自动/手动依赖追踪」不同。</p>
        </details>
      </main>
    </TodoProvider>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· Next Server Actions
// · Vue2/Vue3 对照：Vue 没有「Server Action」概念，写操作要么前端 axios 调后端接口，要么 Nuxt server route；
// · React/Next 对照：Server Actions 是「跑在服务器上的异步函数」，<form action> 直接绑，写库后 revalidateTag 刷新，无需手写 API 路由。
// 📌 实战定位：Next 全栈写操作【了解即可·进阶】，小表单/后台写操作很香；复杂场景仍可用 Route Handler + 客户端 fetch。
// 🧭 学习模式：🔧固定写法='use server' + updateTag（Next16 中 Server Action 立即失效用 updateTag；revalidateTag 第二参 profile 已变必填）；👉=练习点（已全部补全，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
import { headers } from 'next/headers'
import TodoForm from './todo-form'
import TodoRow from './todo-row'
import type { Todo } from './types'

// 服务端读列表：revalidateTag('todos') 重渲染时重新拉取，新提交即时可见。
// 关键：fetch 打 next.tags:['todos']，mutation 侧用 revalidateTag 精确失效（练习点③）。
async function getTodos(): Promise<Todo[]> {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:4000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/todo?pageSize=20&sort=-id`, {
    next: { tags: ['todos'] },
  })
  const j = await res.json()
  return (j.data as Todo[]) || []
}

export default async function ServerActionsPage() {
  const todos = await getTodos()
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Server Actions</h1>
      <p>
        下面整套 CRUD 直接把数据交给 Server Action，不经过前端 fetch / API 路由（底层仍走本仓库 /api/todo 真实接口）。
      </p>

      {/* 增：客户端表单 + useActionState 错误提示 */}
      <TodoForm />

      {/* 查 + 改 + 删：服务端读列表，每行一个客户端组件处理 */}
      <ul className="mt-4 space-y-1 text-sm">
        {todos.map((t: Todo) => (
          <TodoRow key={t.id} todo={t} />
        ))}
        {todos.length === 0 && (
          <li className="text-gray-400">暂无待办（提交后会在这里出现）</li>
        )}
      </ul>

      <h2>进阶练习（已补全）</h2>
      <ul>
        <li>✅ 在 action 里 try/catch，失败返回错误并由表单 useActionState 提示（createTodo / updateTodo 均含）</li>
        <li>✅ SubmitButton 用 useFormStatus 在按钮显示「提交中…」</li>
        <li>✅ getTodos 的 fetch 打 tags:['todos']，各 action 用 updateTag 精确失效（非整页；Next16 中 revalidateTag 需显式 profile，Server Action 推荐 updateTag）</li>
        <li>✅ 增删改查齐全：createTodo / updateTodo / toggleTodo / deleteTodo</li>
      </ul>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2 / Vue3</th>
              <th className="px-2 py-1">React (Next)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">写操作入口</td><td className="px-2 py-1">axios 调后端 / Nuxt server route</td><td className="px-2 py-1">Server Action（'use server'）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">落地数据</td><td className="px-2 py-1">后端路由写库</td><td className="px-2 py-1">action 内直接写（本仓库可 POST /api/todo）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">刷新页面</td><td className="px-2 py-1">前端重新拉接口</td><td className="px-2 py-1">revalidatePath / revalidateTag</td></tr>
            <tr className="border-b"><td className="px-2 py-1">提交态</td><td className="px-2 py-1">自己管 loading</td><td className="px-2 py-1">useFormStatus 自动 pending</td></tr>
            <tr className="border-b"><td className="px-2 py-1">错误回显</td><td className="px-2 py-1">catch 后 setState</td><td className="px-2 py-1">useActionState 捕获返回</td></tr>
            <tr className="border-b"><td className="px-2 py-1">适用</td><td className="px-2 py-1">通用业务接口</td><td className="px-2 py-1">小表单 / 后台写操作</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Server Actions 省掉手写 API 路由，表单直绑；复杂写操作仍可用 Route Handler + 客户端 fetch。本项目按铁律统一走 /api 真实接口。</p>
      </details>
    </main>
  )
}

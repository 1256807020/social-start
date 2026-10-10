// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· Next Server Actions
// · Vue2/Vue3 对照：Vue 没有「Server Action」概念，写操作要么前端 axios 调后端接口，要么 Nuxt server route；
// · React/Next 对照：Server Actions 是「跑在服务器上的异步函数」，&lt;form action&gt; 直接绑，写库后 revalidatePath 刷新，无需手写 API 路由。
// 📌 实战定位：Next 全栈写操作【了解即可·进阶】，小表单/后台写操作很香；复杂场景仍可用 Route Handler + 客户端 fetch。
// 🧭 学习模式：🔧固定写法='use server' + revalidatePath；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
// 服务端组件（无需 'use client'）即可定义并调用 Server Action
import { revalidatePath } from 'next/cache'

/**
 * 高阶：Server Actions（搬运自进阶大纲 advanced-server-actions）
 *  Server Actions 是 Next 的服务端异步函数，可被 <form action={...}> 或客户端调用，
 *  无需手写 API 路由即可完成「提交 → 改数据 → 刷新」闭环。
 * 每个 👉 是给你手敲的练习点。
 */

// 👉 手敲：定义一个 Server Action（函数体内首行写 'use server'）
async function createTodo(formData: FormData) {
  'use server'
  // 👉 1. 读表单：const title = formData.get('title')
  // 👉 2. 写数据（如 POST 到本仓库 /api/todo，或用 lib/crud 直接落 json-db）
  // 👉 3. 失效缓存：revalidatePath('/advanced-server-actions') 让页面重渲染
  console.log('submit', Object.fromEntries(formData))
}

export default function ServerActionsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Server Actions</h1>
      <p>
        下面的 form 直接把数据交给上面的 server action，不经过前端 fetch / API 路由。
      </p>
      {/* 👉 把 action 绑到 form：<form action={createTodo}> */}
      <form action={createTodo}>
        <input name="title" placeholder="待办标题" />
        <button type="submit">提交</button>
      </form>

      <h2>进阶练习</h2>
      <ul>
        <li>👉 在 action 里增加 try/catch，失败时返回错误并让表单提示</li>
        <li>👉 用 <code>useFormStatus</code> 在客户端按钮显示「提交中…」</li>
        <li>👉 用 <code>revalidateTag</code> 按标签精确失效，而非整页</li>
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
            <tr className="border-b"><td className="px-2 py-1">适用</td><td className="px-2 py-1">通用业务接口</td><td className="px-2 py-1">小表单 / 后台写操作</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Server Actions 省掉手写 API 路由，表单直绑；复杂写操作仍可用 Route Handler + 客户端 fetch。本项目按铁律统一走 /api 真实接口。</p>
      </details>

    </main>
  )
}

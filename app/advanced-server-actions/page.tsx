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
    </main>
  )
}

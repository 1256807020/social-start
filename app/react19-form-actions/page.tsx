'use client'

import { useActionState, useFormStatus } from 'react'

/**
 * React 19 表单 Actions 全家桶（搬运自 ReactAdm03）
 *  1. useActionState —— 跟踪异步表单的 pending/error/结果（替代旧 useFormState）
 *  2. useFormStatus —— 子组件里读取“父表单”的提交状态，无需 props 透传
 *  3. Actions API —— <form action={异步函数}> 直接传函数，非受控、自动收集 FormData
 * 每个 👉 是给你手敲的练习点。
 */

/* ---------- 1. useActionState：异步表单提交 ---------- */
// 👉 手敲：async 函数 (prevState, formData) => newState，内部 await 模拟请求
async function signupAction(
  _prev: { ok: boolean; msg: string },
  formData: FormData,
): Promise<{ ok: boolean; msg: string }> {
  // 👉 读取 formData.get('email')，模拟 await，返回 { ok, msg }
  await new Promise((r) => setTimeout(r, 800))
  const email = String(formData.get('email') ?? '')
  return { ok: true, msg: `注册成功（模拟）: ${email}` }
}

function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, {
    ok: false,
    msg: '',
  })
  return (
    <form action={formAction}>
      <input name="email" placeholder="email" />
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中…' : '注册'}
      </button>
      {state.msg && <p>{state.msg}</p>}
    </form>
  )
}

/* ---------- 2. useFormStatus：子组件读父表单状态 ---------- */
function SubmitButton() {
  const { pending } = useFormStatus() // 👉 无需 props，自动拿到外层 <form> 的提交状态
  return (
    <button type="submit" disabled={pending}>
      {pending ? '保存中…' : '保存'}
    </button>
  )
}

function ProfileForm() {
  // 👉 手敲：action 里用 formData 收集字段
  return (
    <form
      action={async (fd: FormData) => {
        // 👉 await 保存 fd.get('name')
        console.log('保存：', fd.get('name'))
      }}
    >
      <input name="name" placeholder="姓名" />
      <SubmitButton />
    </form>
  )
}

/* ---------- 3. Actions API：form action 直接传函数（非受控） ---------- */
function AddTodoForm() {
  // 👉 手敲：action 接收 FormData，调用后端 /api/todo 创建
  return (
    <form
      action={async (formData: FormData) => {
        const title = formData.get('title')
        // 👉 await fetch('/api/todo', { method:'POST', body: JSON.stringify({title}) })
        console.log('新增：', title)
      }}
    >
      <input name="title" placeholder="待办标题" />
      <button type="submit">添加</button>
    </form>
  )
}

export default function React19FormActionsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>React 19 · 表单 Actions</h1>
      <section>
        <h2>① useActionState</h2>
        <SignupForm />
      </section>
      <section>
        <h2>② useFormStatus（子组件拿表单状态）</h2>
        <ProfileForm />
      </section>
      <section>
        <h2>③ Actions API（form action 传函数）</h2>
        <AddTodoForm />
      </section>
    </main>
  )
}

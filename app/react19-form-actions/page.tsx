// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（表单篇 · React 19）· 表单 Actions 全家桶
// · Vue2 对照：表单靠 v-model 双向绑定 + methods 里手动 axios 提交，无内置 action 概念；
// · Vue3 对照：&lt;script setup&gt; 里 ref 绑 v-model，submit 调 async 函数，pending/error 自己管；
// · React 对照：React 19 的 &lt;form action={异步fn}&gt; + useActionState + useFormStatus 把「pending/error/重置」内建化（本例）。
// 📌 实战定位：表单提交态管理【常规业务常用】；React 19 新 API 让非受控表单更简洁，旧项目仍可用 react-hook-form。
// 🧭 学习模式：🔧固定写法=action 函数 / useActionState / useFormStatus；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2 (Options)</th>
              <th className="px-2 py-1">Vue3 (Composition)</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">提交入口</td><td className="px-2 py-1">@submit + methods</td><td className="px-2 py-1">@submit + async</td><td className="px-2 py-1">&lt;form action={fn}&gt;</td></tr>
            <tr className="border-b"><td className="px-2 py-1">pending 态</td><td className="px-2 py-1">this.loading</td><td className="px-2 py-1">ref(loading)</td><td className="px-2 py-1">useFormStatus / isPending</td></tr>
            <tr className="border-b"><td className="px-2 py-1">错误/结果</td><td className="px-2 py-1">手写</td><td className="px-2 py-1">ref(err)</td><td className="px-2 py-1">useActionState</td></tr>
            <tr className="border-b"><td className="px-2 py-1">收集字段</td><td className="px-2 py-1">v-model</td><td className="px-2 py-1">v-model</td><td className="px-2 py-1">FormData 自动收集</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React19 把表单 pending/error/重置内建化；老项目用 react-hook-form 同样顺手。AddTodoForm 里已演示 action 调 /api/todo 新增。</p>
      </details>

    </main>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（异步 UI 篇 · React 19）· useOptimistic & use()
// · Vue2 对照：乐观更新靠先 push 到 data 再 axios，失败在 catch 里 splice 回滚（手写）；
// · Vue3 对照：同 Vue2（ref 先改再请求，失败回滚），无内建 useOptimistic；
// · React 对照：useOptimistic 自动乐观插入、失败回滚；use() 直接在组件读 Promise（配 Suspense）。
// 📌 实战定位：乐观更新/异步读取【了解即可·进阶】，React 19 新特性；旧版用 SWR/React Query 的 optimistic 能力。
// 🧭 学习模式：🔧固定写法=useOptimistic(addOptimistic) / use(promise)；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useOptimistic, use, Suspense, useState } from 'react'

/**
 * React 19 异步 UI 新特性（搬运自 ReactAdm03）
 *  1. useOptimistic —— 异步完成前先更新 UI，失败自动回滚
 *  2. use() —— 直接在组件里读 Promise / Context（配合 Suspense + ErrorBoundary）
 * 每个 👉 是给你手敲的练习点。
 */

/* ---------- 1. useOptimistic：乐观更新 ---------- */
type Msg = { id: number; text: string; sending?: boolean }

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current, newMsg: Msg) => [...current, newMsg],
  )

  async function send(text: string) {
    const tmp: Msg = { id: Date.now(), text, sending: true }
    addOptimistic(tmp) // 👉 立即乐观插入到 UI
    // 👉 await 模拟请求：
    //   成功 → setMessages([...messages, { ...tmp, sending: false }])
    //   失败 → 不更新 setMessages，useOptimistic 自动回滚到 messages
    await new Promise((r) => setTimeout(r, 800))
    setMessages((prev) => [...prev, { ...tmp, sending: false }])
  }

  return (
    <div>
      <ul>
        {optimisticMessages.map((m) => (
          <li key={m.id}>
            {m.text}
            {m.sending ? ' (发送中…)' : ''}
          </li>
        ))}
      </ul>
      <button onClick={() => send('你好')}>发送</button>
    </div>
  )
}

/* ---------- 2. use()：在组件里直接读 Promise ---------- */
function fetchUser(id: number): Promise<{ name: string }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ name: `用户${id}` }), 800),
  )
}

function User({ promise }: { promise: Promise<{ name: string }> }) {
  const user = use(promise) // 👉 React 19：直接读 Promise，自动处理 pending（需外层 Suspense）
  return <p>用户名：{user.name}</p>
}

function UserSection() {
  const promise = fetchUser(1)
  return (
    <Suspense fallback={<p>加载中…</p>}>
      <User promise={promise} />
    </Suspense>
  )
}

export default function React19AsyncUiPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>React 19 · 异步 UI</h1>
      <section>
        <h2>① useOptimistic（乐观更新）</h2>
        <Chat />
      </section>
      <section>
        <h2>② use() 读 Promise</h2>
        <UserSection />
      </section>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">乐观更新</td><td className="px-2 py-1">data 先 push</td><td className="px-2 py-1">ref 先改</td><td className="px-2 py-1">useOptimistic（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">读 Promise</td><td className="px-2 py-1">无</td><td className="px-2 py-1">无</td><td className="px-2 py-1">use() + Suspense</td></tr>
            <tr className="border-b"><td className="px-2 py-1">失败回滚</td><td className="px-2 py-1">catch 里 splice</td><td className="px-2 py-1">catch 里回滚</td><td className="px-2 py-1">useOptimistic 自动回滚</td></tr>
            <tr className="border-b"><td className="px-2 py-1">依赖</td><td className="px-2 py-1">手写</td><td className="px-2 py-1">手写</td><td className="px-2 py-1">Suspense + ErrorBoundary</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React19 把乐观更新/异步读取内建；Vue 靠手写 ref + catch 回滚实现同类效果。</p>
      </details>

    </main>
  )
}

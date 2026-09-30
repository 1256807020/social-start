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
    </main>
  )
}

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

  // 👉 表单 action 本身就是 transition，addOptimistic 在其中调用合法（避免 “optimistic update outside a transition” 报错）
  async function send(formData: FormData) {
    const text = String(formData.get('text') ?? '').trim()
    if (!text) return
    const tmp: Msg = { id: Date.now(), text, sending: true }
    addOptimistic(tmp) // 👉 立即乐观插入到 UI
    // 👉 调真实 /api/todo 创建（POST 体即 {title}）；成功才写入真实 messages，失败不写 → useOptimistic 自动回滚
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text }),
      })
      const j = await res.json()
      if (j.code === 0) {
        const data = j.data as { id?: number } | null
        setMessages((prev) => [
          ...prev,
          { id: data?.id ?? tmp.id, text, sending: false },
        ])
      } else {
        console.error('发送失败：', j.msg)
      }
    } catch (e) {
      console.error('请求出错：', (e as Error).message)
    }
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
      <form action={send}>
        <input name="text" placeholder="说点什么" defaultValue="你好" />
        <button type="submit">发送</button>
      </form>
    </div>
  )
}

/* ---------- 2. use()：在组件里直接读 Promise ---------- */
function fetchUser(id: number): Promise<{ name: string }> {
  // 👉 用真实 /api/user 演示 use(promise) 读 Promise（专属资源库，基座自动建；GET 缺失库返回 []，SSR 阶段无 window 兜底返回占位避免相对 URL 在服务端 fetch 崩溃）
  if (typeof window === 'undefined') {
    return Promise.resolve({ name: `用户${id}` })
  }
  return fetch('/api/user')
    .then((r) => r.json())
    .then((j) => {
      const list = (j.data as { title: string }[] | undefined) ?? []
      return { name: list[0]?.title ?? `用户${id}` }
    })
}

function User({ promise }: { promise: Promise<{ name: string }> }) {
  const user = use(promise) // 👉 React 19：直接读 Promise，自动处理 pending（需外层 Suspense）
  return <p>用户名：{user.name}</p>
}

function UserSection() {
  // 👉 用 useState 惰性初始化把 promise「固定」下来：use(promise) 要求 promise 身份稳定，
  // 若每次渲染都 new 一个新 promise，会陷入「suspend→resolve→又 new→再 suspend」的死循环，永远停在 fallback。
  const [promise] = useState(() => fetchUser(1))
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
        <p className="mt-2 text-gray-500">📝 小结：React19 把乐观更新/异步读取内建；Vue 靠手写 ref + catch 回滚实现同类效果。本例 Chat 的乐观插入已接真实 POST /api/chat（专属聊天库，基座自动建，失败自动回滚），use() 读 Promise 也走真实 GET /api/user（专属用户库，GET 缺失库返回 []，SSR 阶段用 typeof window 兜底避免相对 URL 在服务端 fetch 崩溃）——均不再复用 /api/todo，展示「任意资源名自动建库」基座。</p>
      </details>

    </main>
  )
}

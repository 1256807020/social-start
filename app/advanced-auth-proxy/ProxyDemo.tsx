// 'use client' 标记：这是一个【客户端组件】，代码会打包进浏览器、在用户浏览器里运行。
// 与 page.tsx（服务端组件）的区别：这里能写 onClick、useState 等交互逻辑。
'use client'

import { useState } from 'react'

type Todo = { id: number | string; title: string; done?: boolean }
type Result = { count: number; items: Todo[]; error: string | null }

/**
 * 浏览器端演示「走 BFF 代理」：只调同源 /advanced-auth-proxy/api/todo。
 * 👉 最该记住的一点：下面这整段前端代码里，【没有任何 token】。
 *    token 在哪？在 route.ts（服务端）里。浏览器发出请求后，由服务器补上 token 再转发真实后端，
 *    最后把数据回给浏览器。这就是「token 不落前端」的具体落地。
 */
export default function ProxyDemo() {
  const [data, setData] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  async function pull() {
    setLoading(true)
    try {
      // 注意 URL 是相对路径、同源的 /advanced-auth-proxy/api/todo
      // —— 浏览器根本不知道真实后端是 /api/todo，更不知道 token。
      const res = await fetch('/advanced-auth-proxy/api/todo?pageSize=5')
      const json = await res.json()
      const list: Todo[] = Array.isArray(json?.data) ? json.data : []
      setData({ count: list.length, items: list.slice(0, 5), error: null })
    } catch (e) {
      setData({ count: 0, items: [], error: e instanceof Error ? e.message : String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded border p-3 text-sm">
      <h2 className="font-bold">② 浏览器端经 BFF 代理拉取</h2>
      <p className="text-gray-500">
        点按钮从浏览器 <code>fetch('/advanced-auth-proxy/api/todo')</code>——同源、安全，token 由服务端注入。
      </p>
      <button
        className="mt-2 rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
        type="button"
        onClick={pull}
        disabled={loading}
      >
        {loading ? '拉取中…' : '经代理拉取 /api/todo'}
      </button>
      {data?.error && <p className="mt-2" style={{ color: '#e33' }}>失败：{data.error}</p>}
      {data && !data.error && (
        <div className="mt-2">
          <p>代理返回条数：<b>{data.count}</b></p>
          <ul className="list-disc pl-5">
            {data.items.map((t) => (
              <li key={String(t.id)}>
                {t.title} {t.done ? '✅' : '⬜'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

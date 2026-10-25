'use client'

// 【next-route-handlers · 交互式测试台】app/next-route-handlers/tester.tsx
// 客户端组件：用 fetch 真实调用上面那几个 Route Handler，把状态码与响应体打出来。
import { useState } from 'react'

type Result = { label: string; status: number; body: string }

const cases = [
  { label: 'GET 列表', url: '/next-route-handlers/api', init: undefined },
  { label: 'GET 带 keyword=苹', url: '/next-route-handlers/api?keyword=苹', init: undefined },
  { label: 'GET 单条 /1', url: '/next-route-handlers/api/1', init: undefined },
  { label: 'GET 不存在的 /999', url: '/next-route-handlers/api/999', init: undefined },
  { label: 'GET ISR 时间接口', url: '/next-route-handlers/api/time', init: undefined },
  {
    label: 'POST 新增',
    url: '/next-route-handlers/api',
    init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '橘子' }) },
  },
  {
    label: 'PATCH 改 /1',
    url: '/next-route-handlers/api/1',
    init: { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '红苹果' }) },
  },
  { label: 'DELETE /2', url: '/next-route-handlers/api/2', init: { method: 'DELETE' } },
]

export default function Tester() {
  const [result, setResult] = useState<Result | null>(null)
  const [pending, setPending] = useState(false)

  async function run(url: string, init?: RequestInit, label?: string) {
    setPending(true)
    try {
      const res = await fetch(url, init)
      const text = await res.text()
      setResult({ label: label ?? url, status: res.status, body: text.slice(0, 400) })
    } catch (e) {
      setResult({ label: label ?? url, status: 0, body: String(e) })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-3 rounded border p-4">
      <p className="text-sm text-gray-600">点按钮真实发请求，观察状态码与响应体：</p>
      <div className="flex flex-wrap gap-2">
        {cases.map((c) => (
          <button
            key={c.label}
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
            disabled={pending}
            onClick={() => run(c.url, c.init, c.label)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-1 rounded bg-gray-50 p-3 text-xs">
          <p>
            <strong>{result.label}</strong> →{' '}
            <span className={result.status >= 400 ? 'text-red-600' : 'text-green-700'}>
              HTTP {result.status}
            </span>
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap">{result.body}</pre>
        </div>
      )}
      <p className="text-xs text-gray-400">
        想看「重定向」：浏览器直接访问 /next-route-handlers/api/old，会跳到 /next-route-handlers/api。
      </p>
    </div>
  )
}

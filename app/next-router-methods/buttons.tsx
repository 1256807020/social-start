'use client'

// 【next-router-methods · useRouter 六方法】app/next-router-methods/buttons.tsx
// 🔧 固定写法：客户端组件里 const router = useRouter() —— 注意是 next/navigation，不是 next/router
//    （next/router 是旧 Pages Router 的 API，App Router 里不能用）。
// 六个方法：push / replace / back / forward / refresh / prefetch。
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function RouterButtons() {
  const router = useRouter()
  const [log, setLog] = useState<string[]>([])
  // startTransition：把「重新请求服务端」标记为非紧急更新，页面不会卡住（配合 refresh 很常见）
  const [isPending, startTransition] = useTransition()

  function push(msg: string) {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString('zh-CN')} — ${msg}`])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* ① push：新增一条历史记录，可后退回来 */}
        <button className="rounded border px-3 py-1 text-sm" onClick={() => { push('router.push(/detail)'); router.push('/next-router-methods/detail') }}>
          push（可后退）
        </button>

        {/* ② replace：替换当前记录，后退回不到这里 */}
        <button className="rounded border px-3 py-1 text-sm" onClick={() => { push('router.replace(/)'); router.replace('/') }}>
          replace（不可后退）
        </button>

        {/* ③ ④ 前进后退：等价于浏览器按钮 */}
        <button className="rounded border px-3 py-1 text-sm" onClick={() => { push('router.back()'); router.back() }}>
          back
        </button>
        <button className="rounded border px-3 py-1 text-sm" onClick={() => { push('router.forward()'); router.forward() }}>
          forward
        </button>

        {/* ⑤ refresh：重新向服务端请求本路由的数据（服务端组件重跑），但不清空客户端 state */}
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          disabled={isPending}
          onClick={() => {
            push('router.refresh()')
            startTransition(() => {
              router.refresh()
            })
          }}
        >
          {isPending ? 'refresh 中…' : 'refresh（重取服务端数据）'}
        </button>

        {/* ⑥ prefetch：手动预取某个路由，之后再跳就几乎是瞬开 */}
        <button className="rounded border px-3 py-1 text-sm" onClick={() => { push('router.prefetch(/detail)'); router.prefetch('/next-router-methods/detail') }}>
          prefetch（预取 /detail）
        </button>
      </div>

      {isPending && <p className="text-xs text-gray-500">正在重新请求服务端（startTransition 中）…</p>}

      {log.length > 0 && (
        <ul className="space-y-1 rounded bg-gray-50 p-3 text-xs">
          {log.map((l, i) => (
            <li key={i} className="font-mono">{l}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

'use client'

// 【next-convention-files · error.tsx 进阶】app/next-convention-files/boom/error.tsx
// 基础版只有 reset()；进阶要解决一个真实问题：
//   reset() 只是「重新渲染这一段」，<strong>不会重新向服务端取数</strong> ——
//   如果错误是「那次取数失败」导致的（接口 500、数据为空），光 reset 会原地再错一次。
//   正确写法：<strong>router.refresh() 让服务端组件重跑 + reset() 清空错误边界</strong>，
//   并且包在 startTransition 里，避免刷新过程把页面卡住。
//
// 🔧 固定写法（进阶四件套）：
//   ① 'use client'（error.tsx 必须是客户端组件）；
//   ② 接收 error（含 digest）与 reset；
//   ③ const router = useRouter(); const [isPending, startTransition] = useTransition();
//   ④ startTransition(() => { router.refresh(); reset() })
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function BoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ✅ 推荐：先让服务端重新取数，再重置错误边界
  function retryWithRefresh() {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  // ⚠️ 基础版：只重新渲染本段，服务端数据仍是旧的（错误若由取数引起，会再次失败）
  function retryResetOnly() {
    reset()
  }

  return (
    <section className="space-y-3 rounded border border-red-300 bg-red-50 p-4">
      <h2 className="text-lg font-semibold text-red-700">这一段出错了（已被 error.tsx 兜住）</h2>
      <p className="font-mono text-xs text-red-600">{error.message}</p>
      {error.digest && <p className="text-xs text-gray-500">digest: {error.digest}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          disabled={isPending}
          onClick={retryWithRefresh}
        >
          {isPending ? '重试中…' : '① 重试（refresh + reset）推荐'}
        </button>
        <button className="rounded border border-red-400 px-3 py-1 text-sm" onClick={retryResetOnly}>
          ② 只 reset（对照：可能原地再错）
        </button>
      </div>

      {isPending && <p className="text-xs text-gray-500">正在重新请求服务端数据…（startTransition 中）</p>}

      <details className="text-xs text-gray-700">
        <summary className="cursor-pointer">两种重试的区别</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <code>reset()</code>：只重置错误边界、重新渲染这一段。
            <strong>服务端数据不会重新获取</strong> —— 适合「纯客户端渲染出错」的场景。
          </li>
          <li>
            <code>router.refresh()</code>：重新向服务端请求本路由，服务端组件重跑一遍拿最新数据。
            <strong>错误由取数引起时必须用它</strong>。
          </li>
          <li>
            <code>startTransition</code>：把这次刷新标记为「非紧急更新」，
            页面在等待期间仍可交互，不会白屏卡死。
          </li>
        </ul>
      </details>

      <p className="text-xs text-gray-500">
        整站其它页面不受影响 —— 这就是「就近降级」的好处。
      </p>
    </section>
  )
}

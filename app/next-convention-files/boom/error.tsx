'use client'

// 【next-convention-files · error.tsx】app/next-convention-files/boom/error.tsx
// 🔧 固定写法三条：
//   ① 必须是客户端组件（'use client'）—— 因为要提供可点击的「重试」；
//   ② 接收两个 props：error（错误对象，生产环境带 digest）、reset（重渲染该段）；
//   ③ 它只捕获「本段及子段」的渲染/取数错误，<strong>抓不到自己同级 layout 的错</strong>。
export default function BoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="space-y-2 rounded border border-red-300 bg-red-50 p-4">
      <h2 className="text-lg font-semibold text-red-700">这一段出错了（已被 error.tsx 兜住）</h2>
      <p className="font-mono text-xs text-red-600">{error.message}</p>
      {error.digest && <p className="text-xs text-gray-500">digest: {error.digest}</p>}
      {/* reset() = 重新渲染本路由段（相当于"重试"） */}
      <button className="rounded bg-red-600 px-3 py-1 text-sm text-white" onClick={() => reset()}>
        重试
      </button>
      <p className="text-xs text-gray-500">
        整站其它页面不受影响 —— 这就是「就近降级」的好处。
      </p>
    </section>
  )
}

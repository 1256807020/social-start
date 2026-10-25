// 【next-intercepting-routes · (..) 拦截器本体】app/next-intercepting-routes/albums/(..)gallery/page.tsx
// (..) = 从当前目录（albums）往上退一级，再匹配 gallery。
// 命中条件：从 /albums 软导航到 /gallery。此时渲染本文件，而不是真实的 gallery/page.tsx。
export default function InterceptedGallery() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold">被 (..) 拦截了</h3>
        <p className="mt-1 text-sm text-gray-600">
          地址栏已经是 <code>/next-intercepting-routes/gallery</code>，
          但渲染的是 <code>albums/(..)gallery</code> —— 上一级拦截生效。
        </p>
        <p className="mt-3 text-xs text-gray-400">
          按 F5 刷新就会换成真实完整页（此时插槽匹配不到 → 走真实路由）。
        </p>
      </div>
    </div>
  )
}

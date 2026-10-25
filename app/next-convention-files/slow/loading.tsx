// 【next-convention-files · loading.tsx】app/next-convention-files/slow/loading.tsx
// 🔧 固定写法：loading.tsx 是「本路由段」的加载态（骨架屏）。
//    页面是 async 服务端组件、还在 await 数据时，Next 会先把它渲染出来。
//    不需要自己写 <Suspense> —— 框架自动帮你包了一层。
export default function SlowLoading() {
  return (
    <section className="space-y-2 rounded border p-4">
      <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <p className="text-xs text-gray-400">骨架屏：数据还在服务端加载（3 秒）…</p>
    </section>
  )
}

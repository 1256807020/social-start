// 【next-parallel-routes · @recent 独立加载态】app/next-parallel-routes/@recent/loading.tsx
// 慢插槽的骨架屏：页面打开后你最先看到的就是这块，2 秒后被真实内容替换。
export default function RecentLoading() {
  return (
    <ul className="space-y-1 text-sm text-gray-400">
      <li className="animate-pulse">最近动态加载中…</li>
      <li className="animate-pulse">　</li>
      <li className="animate-pulse">　</li>
    </ul>
  )
}

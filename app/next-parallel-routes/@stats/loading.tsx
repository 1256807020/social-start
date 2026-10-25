// 【next-parallel-routes · @stats 独立加载态】app/next-parallel-routes/@stats/loading.tsx
// 🔧 固定写法：loading.tsx 是「该文件所在路由段」的加载态。
//    放在 @stats 里，就只作用于 @stats 这个插槽，不影响主区与 @recent。
export default function StatsLoading() {
  return (
    <div className="space-y-1 text-sm text-gray-400">
      <p className="animate-pulse">统计加载中…</p>
    </div>
  )
}

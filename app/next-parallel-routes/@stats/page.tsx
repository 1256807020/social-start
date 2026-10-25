// 【next-parallel-routes · @stats 插槽】app/next-parallel-routes/@stats/page.tsx
// 服务端组件：插槽本身就可以 async 取数，和其它插槽互不阻塞。
// 这里模拟一个「快」的数据域（0.5 秒）。
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default async function StatsSlot() {
  await sleep(500)
  return (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-gray-500">今日访问</dt>
        <dd className="font-semibold">1,286</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-gray-500">在线人数</dt>
        <dd className="font-semibold">42</dd>
      </div>
      <p className="pt-1 text-xs text-gray-400">（模拟 0.5s 后返回，快插槽）</p>
    </dl>
  )
}

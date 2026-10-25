// 【next-parallel-routes · @recent 插槽】app/next-parallel-routes/@recent/page.tsx
// 故意模拟一个「慢」的数据域（2 秒）：用来证明它不会拖住主区和 @stats。
// 实战里这就是「评论区 / 推荐位 / 报表」这类慢查询 —— 用平行路由把它隔离出去，
// 首屏该出的先出，慢的通过流式（streaming）后补。
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default async function RecentSlot() {
  await sleep(2000)
  const items = [
    { id: 1, text: '张三 发布了新文章' },
    { id: 2, text: '李四 评论了你的动态' },
    { id: 3, text: '王五 关注了你' },
  ]
  return (
    <ul className="space-y-1 text-sm">
      {items.map((it) => (
        <li key={it.id} className="border-b pb-1 last:border-0">
          {it.text}
        </li>
      ))}
      <li className="pt-1 text-xs text-gray-400">（模拟 2s 后返回，慢插槽）</li>
    </ul>
  )
}

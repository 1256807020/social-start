// 【next-intercepting-routes · 列表（背景页）】app/next-intercepting-routes/page.tsx
// 这是 children 插槽：点下面任意一条，URL 变成 /next-intercepting-routes/photo/1，
// 但因为 @modal 里存在 (.)photo/[id] 拦截器，这一页会<strong>留在原地</strong>作为背景，
// 弹层盖在上面 —— 列表的滚动位置、筛选状态全部保留。
import Link from 'next/link'

const photos = [
  { id: '1', title: '晨光里的海岸', desc: '日出时分，潮水退去的礁石。' },
  { id: '2', title: '城市夜色', desc: '高处的天台，远处的车流。' },
  { id: '3', title: '山间雾起', desc: '雨后的山谷，云在半腰。' },
]

export default function PhotoList() {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">照片列表（点开是弹层）</h2>
      <ul className="space-y-2">
        {photos.map((p) => (
          <li key={p.id} className="rounded border p-3">
            {/* 🔧 固定写法：必须用 next/link 做「软导航」，拦截才会生效；
                换成 <a href> 会整页跳转，直接落到真实详情页。 */}
            <Link className="font-medium underline" href={`/next-intercepting-routes/photo/${p.id}`}>
              {p.title}
            </Link>
            <p className="text-sm text-gray-500">{p.desc}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400">
        试试：点一条 → 弹层；然后按 F5 刷新 → 变成完整详情页。
      </p>
      <p className="text-sm">
        <Link className="underline" href="/next-intercepting-routes/albums">
          → 再看 (..) 上一级拦截的示例
        </Link>
        （目标页与本目录同级，所以拦截器要写在子目录里往上退一级）
      </p>
    </section>
  )
}

// 【next-intercepting-routes · 真实完整详情页】app/next-intercepting-routes/photo/[id]/page.tsx
// 刷新、直接粘贴链接、从搜索引擎点进来 → 都走这里（此时 @modal 渲染 default.tsx = null）。
// 这样「分享出去的链接」依然是一张正经的完整页面，对 SEO 友好。
import Link from 'next/link'

const photos: Record<string, { title: string; desc: string }> = {
  '1': { title: '晨光里的海岸', desc: '日出时分，潮水退去的礁石。' },
  '2': { title: '城市夜色', desc: '高处的天台，远处的车流。' },
  '3': { title: '山间雾起', desc: '雨后的山谷，云在半腰。' },
}

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photo = photos[id]

  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-xl font-bold">{photo?.title ?? '未找到'}</h2>
      <p className="text-sm text-gray-600">{photo?.desc}</p>
      <p className="rounded bg-amber-50 p-2 text-xs text-amber-700">
        当前是<strong>完整详情页</strong>（硬刷新/直达）。同一 URL 软导航过来则是弹层 —— 一套代码两种呈现。
      </p>
      <Link className="inline-block underline" href="/next-intercepting-routes">
        ← 返回列表
      </Link>
    </section>
  )
}

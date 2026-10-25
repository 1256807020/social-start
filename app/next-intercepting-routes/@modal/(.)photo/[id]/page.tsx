// 【next-intercepting-routes · 拦截器】app/next-intercepting-routes/@modal/(.)photo/[id]/page.tsx
// (.) 表示「拦截同级路由」：目标是 app/next-intercepting-routes/photo/[id]（与本插槽同层）。
// 命中条件：从列表软导航过来。此时这一坨会被渲染进 @modal 插槽，盖在列表之上。
// Next 15+：动态段的 params 是 Promise，必须 await。
import Link from 'next/link'

const photos: Record<string, { title: string; desc: string }> = {
  '1': { title: '晨光里的海岸', desc: '日出时分，潮水退去的礁石。' },
  '2': { title: '城市夜色', desc: '高处的天台，远处的车流。' },
  '3': { title: '山间雾起', desc: '雨后的山谷，云在半腰。' },
}

export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photo = photos[id]

  return (
    // 弹层：fixed 全屏遮罩 + 居中卡片
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold">{photo?.title ?? '未找到'}</h3>
        <p className="mt-1 text-sm text-gray-600">{photo?.desc}</p>
        <p className="mt-3 text-xs text-gray-400">
          这是<strong>拦截后的弹层</strong>（URL 已是 /photo/{id}，但列表还在背后）。
        </p>
        {/* 关闭 = 软导航回列表，弹层消失 */}
        <Link className="mt-4 inline-block rounded bg-gray-900 px-3 py-1.5 text-sm text-white" href="/next-intercepting-routes">
          关闭
        </Link>
      </div>
    </div>
  )
}

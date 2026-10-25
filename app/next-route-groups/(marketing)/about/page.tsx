// 【next-route-groups · (marketing) 组内页面】app/next-route-groups/(marketing)/about/page.tsx
// 真实 URL = /next-route-groups/about（没有 marketing 这一级）。
import Link from 'next/link'
import Panel from '../../_components/panel'

export default function AboutPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-xl font-bold">关于我们 · /next-route-groups/about</h1>
      <Panel title="组内复用的私有组件">
        这个 Panel 来自 <code>_components/panel.tsx</code>：<strong>下划线开头 = 私有目录，不生成路由</strong>。
      </Panel>
      <Link className="inline-block underline" href="/next-route-groups">
        ← 返回目录
      </Link>
    </section>
  )
}

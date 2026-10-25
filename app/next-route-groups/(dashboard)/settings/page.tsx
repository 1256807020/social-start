// 【next-route-groups · (dashboard) 组内页面】app/next-route-groups/(dashboard)/settings/page.tsx
// 真实 URL = /next-route-groups/settings（没有 dashboard 这一级）。
// 对比 /next-route-groups/about：两者 URL 层级相同，却各自套着不同的壳。
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-xl font-bold">系统设置 · /next-route-groups/settings</h1>
      <p className="rounded bg-gray-50 p-2 text-sm">
        这一页套的是 <strong>(dashboard)</strong> 的侧边栏外壳；而 /about 套的是 (marketing) 的 banner 外壳。
        两组 URL 层级完全一样 —— 这就是路由组的价值。
      </p>
      <Link className="inline-block underline" href="/next-route-groups">
        ← 返回目录
      </Link>
    </section>
  )
}

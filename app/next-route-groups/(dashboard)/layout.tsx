// 【next-route-groups · (dashboard) 组外壳】app/next-route-groups/(dashboard)/layout.tsx
// 另一组、另一种壳：后台常见的「左侧边栏 + 右内容」。
// 与 (marketing) 完全隔离 —— 两组可以有同名页面（如各自的 page.tsx）而不冲突。
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-4xl gap-4 p-6 md:grid-cols-4">
      <aside className="rounded bg-gray-100 p-3 text-sm">
        <p className="mb-2 font-semibold">后台侧边栏</p>
        <p className="text-xs text-gray-600">来自 (dashboard) 组外壳</p>
      </aside>
      <div className="md:col-span-3">{children}</div>
    </div>
  )
}

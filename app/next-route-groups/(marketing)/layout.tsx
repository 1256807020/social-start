// 【next-route-groups · (marketing) 组外壳】app/next-route-groups/(marketing)/layout.tsx
// 🔧 固定写法：路由组的 layout.tsx 只作用于「本组内」的页面。
//    组的名字 (marketing) 不会出现在 URL 里，纯粹是给这一组页面套同一个外壳。
import type { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      {/* 组内共享：营销页顶部的 banner */}
      <div className="rounded bg-sky-50 p-3 text-sm text-sky-800">
        📣 这是 <strong>(marketing) 组</strong> 的外壳 —— URL 里不会出现 marketing。
      </div>
      {children}
    </div>
  )
}

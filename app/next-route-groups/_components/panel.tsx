// 【next-route-groups · 私有目录示例】app/next-route-groups/_components/panel.tsx
// 🔧 固定写法：文件夹名以「下划线」开头（_components）即为私有目录，
//    Next.js 不会把它当成路由段 —— 访问 /next-route-groups/_components 是 404。
//    适合放「只服务于本模块」的组件、工具、hook，避免污染路由空间。
import type { ReactNode } from 'react'

export default function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border p-3">
      <p className="mb-1 text-sm font-semibold">{title}</p>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  )
}

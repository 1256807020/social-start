'use client'

// 【next-template · template.tsx（每次导航重新挂载）】app/next-template/template.tsx
// 🔧 固定写法：template.tsx 与 layout.tsx 用法完全一样（都是包 children），
//    唯一区别：<strong>每次导航都会重新创建实例</strong>，state 归零、DOM 重建、入场动画重放。
// 什么时候用 template 而不是 layout？
//   ① 需要「每次进页面都重放入场动画」；② 需要「重置滚动位置 / 清空子组件状态」；
//   ③ 依赖 useEffect 做逐页初始化的逻辑（layout 只在首次跑一次）。
import { useEffect, useState } from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
  // 记录「本次挂载时刻」：每次导航都会刷新这个时间 —— 这就是重新挂载的证据。
  // 用 Effect 里再取时间，避免服务端/客户端时间不一致导致 hydration mismatch。
  const [mountedAt, setMountedAt] = useState('')
  useEffect(() => {
    setMountedAt(new Date().toLocaleTimeString())
  }, [])

  return (
    <div className="space-y-3">
      <div className="rounded border bg-amber-50 p-3 text-sm">
        <strong>template 的状态</strong>：本次挂载于 <span className="font-mono">{mountedAt || '…'}</span>
        <p className="text-xs text-gray-600">
          在 A / B 之间切换，这个时间每次都会变（重新挂载）；上面的 layout 计数则纹丝不动。
        </p>
      </div>
      {children}
    </div>
  )
}

// 【next-script · beforeInteractive 必须放在 layout】app/next-script/layout.tsx
// 🔧 固定写法：<strong>strategy="beforeInteractive" 只允许出现在根 layout（或本段的 layout）</strong>，
//    放在普通 page.tsx 里 Next 会报错。
//    语义：在 Next 自己的 JS 执行<strong>之前</strong>就加载 —— 只给「必须在水合前就绪」的脚本用
//    （如埋点 SDK、polyfill、A/B 分流）。绝大多数第三方脚本都不需要它。
import Script from 'next/script'
import type { ReactNode } from 'react'

export default function ScriptLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Script src="/next-script-demo.js" strategy="beforeInteractive" />
      {children}
    </div>
  )
}

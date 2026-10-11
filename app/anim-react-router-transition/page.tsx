// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·路由过渡篇）· Next App Router + Motion
// · Vue2/Vue3 对照：Vue 用 <router-view> 外套 <transition> + <transition name> 做进出场；React 这边 App Router 用 template.tsx 重挂载 + motion 做进场。
// · React 对照：本段 template.tsx 用 framer-motion 包 children，每次切路由都触发进场动画（见 template.tsx）。
// 📌 实战定位：路由级过渡【了解即可·进阶】；列表进出/布局切换首选 Motion，路由切换用 template.tsx（退出动画需 FrozenRouter 进阶技巧）。
// 🧭 学习模式：🔧固定写法=在段目录放 template.tsx → motion.div initial/animate 包 children；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import Link from 'next/link'

export default function RouterTransitionHub() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>React Router 过渡（Next App Router）</h1>
      <p>本路由段用 <code>template.tsx</code> + framer-motion 做进场动画。点下面的链接跳转，注意页面淡入上移。</p>
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {/* 👉 跳转即触发 template 的进场动画 */}
        <Link href="/anim-react-router-transition/a" style={{ color: '#48f' }}>去 A 页 →</Link>
        <Link href="/anim-react-router-transition/b" style={{ color: '#48f' }}>去 B 页 →</Link>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">出口</td><td className="px-2 py-1">&lt;router-view&gt; + &lt;transition&gt;</td><td className="px-2 py-1">template.tsx（段级重挂载）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">进场</td><td className="px-2 py-1">transition name 自动</td><td className="px-2 py-1">motion.div initial/animate</td></tr>
            <tr className="border-b"><td className="px-2 py-1">退场</td><td className="px-2 py-1">&lt;transition&gt; 原生</td><td className="px-2 py-1">需 FrozenRouter 进阶</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：App Router 把「每次导航重挂载」交给 template.tsx，配合 Motion 即可零成本拿进场过渡；想做退场要保持旧 UI 挂载到动画结束（进阶）。</p>
      </details>
    </main>
  )
}

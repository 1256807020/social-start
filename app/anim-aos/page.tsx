// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·AOS.js 篇）· 滚动触发入场
// · Vue2/Vue3 对照：AOS 框架无关，Vue 里 onMounted AOS.init() + 元素加 data-aos；用法与 React 一致。
// · React 对照：useEffect 里 AOS.init()，给元素加 data-aos="fade-up" 等属性，进入视口自动播放（本例）。
// 📌 实战定位：零配置滚动入场【了解即可·入门】；元素进视口即优雅入场，快速提升普通页面交互质感，成本极低。
// 🧭 学习模式：🔧固定写法=import AOS from 'aos'; AOS.init(); <div data-aos="fade-up">；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
// 练习前在本分支运行：pnpm add aos

export default function AosPage() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true }) // 👉 once=true 只播一次
  }, [])

  const blocks = [
    { aos: 'fade-up', c: '#48f', t: 'fade-up' },
    { aos: 'fade-left', c: '#4f8', t: 'fade-left' },
    { aos: 'fade-right', c: '#f48', t: 'fade-right' },
    { aos: 'zoom-in', c: '#fa3', t: 'zoom-in' },
  ]

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui', minHeight: '180vh' }}>
      <h1>AOS.js：滚动入场动画</h1>
      <p>向下滚动，色块进入视口时按各自 data-aos 播放入场。</p>
      <div style={{ display: 'grid', gap: 40, marginTop: 40 }}>
        {blocks.map((b, i) => (
          <div
            key={i}
            data-aos={b.aos}
            style={{ height: 160, background: b.c, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 20 }}
          >
            {b.t}
          </div>
        ))}
        {/* 👉 试试把上面的 aos 换成 flip-up / slide-up / fade-down 等 */}
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">初始化</td><td className="px-2 py-1">onMounted AOS.init</td><td className="px-2 py-1">useEffect AOS.init</td></tr>
            <tr className="border-b"><td className="px-2 py-1">标记</td><td className="px-2 py-1">data-aos 属性</td><td className="px-2 py-1">data-aos 属性（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">底层</td><td className="px-2 py-1">IntersectionObserver</td><td className="px-2 py-1">IntersectionObserver</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：AOS 是「滚动入场」零配置方案；进阶滚动联动（视差/进度）再上 GSAP ScrollTrigger。本例 social-basic 对应 anim-aos-granim。</p>
      </details>
    </main>
  )
}

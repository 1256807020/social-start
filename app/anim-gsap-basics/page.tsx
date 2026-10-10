// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·核心篇）· GSAP
// · Vue2/Vue3 对照：GSAP 框架无关，Vue 里 onMounted 初始化、onUnmounted ctx.revert()；用法与 React 完全一致；
// · React 对照：useRef 拿根 + useEffect 里 gsap.context(...,root)、卸载 ctx.revert()（本例）。
// 📌 实战定位：JS 动画【了解即可·进阶】；GSAP 是动画天花板，时间线 / 滚动驱动 / 跨浏览器一致；和 CSS 动画互补。
// 🧭 学习模式：🔧固定写法=gsap.to/from/timeline + gsap.context 清理；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
// 练习前在本分支运行：pnpm add gsap lenis

/**
 * 地基②：GSAP 核心（Tween / Timeline / Stagger / Ease）
 *  GSAP 是 JS 动画天花板：时间线编排 + 滚动驱动 + 跨浏览器一致。
 *  记住核心 API：gsap.to / gsap.from / gsap.timeline / stagger / ease。
 *  每个 👉 是给你手敲的练习点。用 gsap.context 包住，卸载时 ctx.revert() 清理。
 */
export default function GsapBasicsPage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 下面是一个可运行示例：进场淡入+上移
      gsap.from('.hero', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' })

      // 👉 1. 基础 tween：gsap.to('.box', { x: 120, rotation: 90, duration: 1, ease: 'power2.out' })
      // 👉 2. 时间线编排：const tl = gsap.timeline({ defaults: { duration: 0.6 } }); tl.to(a,{x:100}).to(b,{y:100}).to(c,{scale:1.2})
      // 👉 3. 交错：gsap.from('.item', { y: 30, opacity: 0, stagger: 0.1, ease: 'back.out(1.7)' })
      // 👉 4. 循环：gsap.to('.spin', { rotation: 360, repeat: -1, duration: 2, ease: 'none' })
      // 👉 5. 缓动大全：power1..4、expo、circ、back、elastic、bounce
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={root} style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1 className="hero">GSAP 核心</h1>
      <div
        className="box"
        style={{ width: 80, height: 80, background: '#4f8', margin: 12 }}
      />
      <ul style={{ display: 'flex', gap: 8, padding: 0 }}>
        {[1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="item"
            style={{ listStyle: 'none', width: 40, height: 40, background: '#48f' }}
          />
        ))}
      </ul>
      <div
        className="spin"
        style={{ width: 60, height: 60, background: '#f48', margin: 12 }}
      />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">动画库</td><td className="px-2 py-1">GSAP（框架无关）</td><td className="px-2 py-1">GSAP（框架无关，本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">初始化</td><td className="px-2 py-1">onMounted</td><td className="px-2 py-1">useEffect + useRef(root)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">核心 API</td><td className="px-2 py-1">gsap.to/from/timeline</td><td className="px-2 py-1">gsap.to/from/timeline</td></tr>
            <tr className="border-b"><td className="px-2 py-1">清理</td><td className="px-2 py-1">onUnmounted ctx.revert()</td><td className="px-2 py-1">useEffect 清理 ctx.revert()</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：GSAP 框架无关，React/Vue 写法一致；用 gsap.context 包裹便于统一清理。</p>
      </details>

    </main>
  )
}

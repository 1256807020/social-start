// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·平滑滚动篇）· Lenis
// · Vue2/Vue3 对照：Vue 没有内置平滑滚动；同样用 Lenis / GSAP 库（框架无关），在 onMounted 里 new Lenis()；
// · React 对照：useRef 拿组件 + useEffect 里 new Lenis()、raf 驱动、卸载 destroy（本例）。
// 📌 实战定位：平滑滚动【了解即可·进阶】；是 GSAP ScrollTrigger 的黄金搭档，做“丝滑惯性滚动”网站常用。
// 🧭 学习模式：🔧固定写法=new Lenis() + raf 循环 + destroy；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
// 练习前在本分支运行：pnpm add gsap lenis

/**
 * 地基①：Lenis 平滑滚动（SmoothScroll）
 *  Lenis 接管原生滚动，用 RAF 做插值，得到“丝滑”的惯性滚动。
 *  它是 GSAP ScrollTrigger 的最佳搭档（见 learn/anim-scroll-trigger）。
 *  每个 👉 是给你手敲的练习点。
 */
export default function LenisBasicsPage() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1, // 👉 插值系数 0~1，越小越“滑”；也可改用 duration + easing
      smoothWheel: true, // 👉 鼠标滚轮平滑
      // wheelMultiplier、touchMultiplier 调灵敏度
    })
    lenisRef.current = lenis

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  function goTo(id: string) {
    // 👉 用 Lenis 做锚点平滑滚动（比原生 scrollIntoView 顺滑）
    lenisRef.current?.scrollTo(`#${id}`, { offset: 0 })
  }

  return (
    <main style={{ fontFamily: 'system-ui' }}>
      <nav
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 8,
          zIndex: 10,
        }}
      >
        {['s1', 's2', 's3', 's4'].map((id, i) => (
          <button key={id} onClick={() => goTo(id)}>
            {i + 1}
          </button>
        ))}
      </nav>

      {['s1', 's2', 's3', 's4'].map((id, i) => (
        <section
          key={id}
          id={id}
          style={{
            height: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: `hsl(${i * 80} 60% 80%)`,
          }}
        >
          <h1>Section {i + 1}</h1>
        </section>
      ))}

      {/* 👉 进阶练习：
          1. 用 lenis.stop() / lenis.start() 在弹窗打开时锁滚动
          2. 自定义 easing：(t:number)=>Math.min(1,1.001-Math.pow(2,-10*t))
          3. 把 raf 接到 gsap.ticker 上（见 anim-scroll-trigger）以统一驱动
      */}
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">平滑滚动</td><td className="px-2 py-1">无内置，用 Lenis</td><td className="px-2 py-1">无内置，用 Lenis（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">初始化</td><td className="px-2 py-1">onMounted new Lenis()</td><td className="px-2 py-1">useEffect new Lenis()</td></tr>
            <tr className="border-b"><td className="px-2 py-1">驱动</td><td className="px-2 py-1">requestAnimationFrame</td><td className="px-2 py-1">requestAnimationFrame</td></tr>
            <tr className="border-b"><td className="px-2 py-1">清理</td><td className="px-2 py-1">onUnmounted destroy</td><td className="px-2 py-1">useEffect 清理 destroy</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Lenis 框架无关，React/Vue 用法几乎一致；关键是 raf 循环 + 卸载销毁。</p>
      </details>

    </main>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·滚动缩放篇）· GSAP ScrollScale + 横向滚动 + 视差
// · Vue2/Vue3 对照：ScrollTrigger 框架无关，Vue 里 onMounted 注册、Lenis 滚动接 ScrollTrigger.update；
// · React 对照：本例 pin + scrub 做缩放 / 横向滚动 / 多层视差，useEffect 清理 revert+destroy。
// 📌 实战定位：滚动缩放 / 横向滚动【了解即可·进阶】；产品展示站常见。
// 🧭 学习模式：🔧固定写法=scrollTrigger {pin,scrub} + Lenis 同步；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
// 练习前在本分支运行：pnpm add gsap lenis
gsap.registerPlugin(ScrollTrigger)

/**
 * 核心组合：ScrollScale / 滚动缩放 + 横向滚动 + 多层视差
 *  很多“产品展示”站用：元素随滚动放大/缩小（scrub），或整屏横向滑过（pin + x）。
 *  每个 👉 是给你手敲的练习点。
 */
export default function ScrollScalePage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => {
      lenis.raf(t)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    const ctx = gsap.context(() => {
      // 1. 滚动缩放：钉住首屏，卡片随滚动从 0.6 放大到 1（pin 让缩放居中可见）
      gsap.fromTo(
        '.scale-card',
        { scale: 0.6, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.scale-wrap', start: 'top top', end: '+=80%', pin: true, scrub: true, invalidateOnRefresh: true },
        },
      )

      // 2. 横向滚动：钉住外层，把 .track 横向平移
      const track = root.current!.querySelector<HTMLElement>('.track')!
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '.h-scroll',
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      // 3. 多层视差：不同层不同速度（背景慢、前景快 → 形成纵深）
      const para = { trigger: '.parallax', start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.to('.layer-sky', { yPercent: -12, ease: 'none', scrollTrigger: para })
      gsap.to('.layer-mid', { yPercent: 8, ease: 'none', scrollTrigger: para })
      gsap.to('.layer-text', { yPercent: -16, ease: 'none', scrollTrigger: para })

      // 👉 4. ScrollSmoother 思路：用 Lenis + 一个“内容包裹层”做整体缓冲
    }, root)
    return () => {
      ctx.revert()
      lenis.destroy()
    }
  }, [])

  return (
    <main ref={root} style={{ fontFamily: 'system-ui' }}>
      <section className="scale-wrap" style={{ height: '100vh', display: 'grid', placeItems: 'center', gap: 24 }}>
        <div className="scale-card" style={{ width: 280, height: 200, background: 'linear-gradient(135deg,#48f,#7af)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }} />
        <p style={{ color: '#666', fontSize: 14 }}>↓ 向下滚动，卡片随滚动放大</p>
      </section>

      <section className="h-scroll" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="track" style={{ display: 'flex', height: '100vh', alignItems: 'center', gap: 24, padding: '0 40px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ flex: '0 0 60vw', height: '70vh', background: `hsl(${i * 60} 70% 60%)`, borderRadius: 16 }} />
          ))}
        </div>
      </section>

      <section className="parallax" style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div className="layer-sky" style={{ position: 'absolute', top: '-30%', left: 0, right: 0, height: '160%', background: 'linear-gradient(180deg,#0b1e3a 0%,#1b3a6b 60%,#2a5da8 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.25) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="layer-mid" style={{ position: 'absolute', top: '-30%', left: 0, right: 0, height: '160%', display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'center' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 90, height: 90, borderRadius: '50%', background: `hsla(${i * 90} 80% 65% / .85)` }} />
          ))}
        </div>
        <div className="layer-text" style={{ position: 'absolute', top: '-30%', left: 0, right: 0, height: '160%', display: 'grid', placeItems: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(40px,8vw,96px)', fontWeight: 800, letterSpacing: 4, textShadow: '0 8px 30px rgba(0,0,0,.4)' }}>视差 PARALLAX</h2>
        </div>
      </section>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">滚动缩放</td><td className="px-2 py-1">ScrollTrigger（框架无关）</td><td className="px-2 py-1">ScrollTrigger（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">横向滚动</td><td className="px-2 py-1">pin + x 位移</td><td className="px-2 py-1">pin + x 位移</td></tr>
            <tr className="border-b"><td className="px-2 py-1">与 Lenis 同步</td><td className="px-2 py-1">lenis.on('scroll', update)</td><td className="px-2 py-1">同左</td></tr>
            <tr className="border-b"><td className="px-2 py-1">清理</td><td className="px-2 py-1">onUnmounted revert</td><td className="px-2 py-1">useEffect 清理 revert+destroy</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：滚动缩放 / 横滚框架无关，关键是 pin+scrub + Lenis 同步 + 卸载清理。</p>
      </details>

    </main>
  )
}

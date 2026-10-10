// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·整合篇）· Agency 落地页样板
// · Vue2/Vue3 对照：整页叙事（Lenis + GSAP）框架无关，Vue 项目同样可搭，思路完全一致；
// · React 对照：本例把 Hero 逐行揭示 + pin 横向作品集 + 视差尾屏串成一条叙事，useEffect 统一清理。
// 📌 实战定位：整页动画整合【了解即可·进阶】；接“出海建站单”的样板间，认领即可。
// 🧭 学习模式：🔧固定写法=前面所有 anim-* 技术的组合 + 统一 ctx.revert()；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
// 练习前在本分支运行：pnpm add gsap lenis
gsap.registerPlugin(ScrollTrigger)

/**
 * 高阶组合：Agency 落地页整合（把前面所有技术串起来）
 *  一条完整叙事：Lenis 平滑滚动 → Hero 逐行揭示 → 钉住横向作品集 → 视差尾屏。
 *  这是“能不能接出海建站单”的样板间。每个 👉 是给你手敲/补全的练习点。
 */
export default function ShowcasePage() {
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
      // Hero 逐行揭示
      gsap.from('.hero-line', {
        yPercent: 100,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.12,
        delay: 0.2,
      })

      // 横向作品集：pin + x
      const track = root.current!.querySelector<HTMLElement>('.track')!
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '.work',
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      // 尾屏视差
      gsap.to('.footer-bg', { yPercent: -30, scrollTrigger: { scrub: true } })

      // 👉 进阶：加进度指示器、加每个作品卡的 hover 放大、加 clip-path 揭示封面
    }, root)
    return () => {
      ctx.revert()
      lenis.destroy()
    }
  }, [])

  return (
    <main ref={root} style={{ fontFamily: 'system-ui' }}>
      <section style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#111', color: '#fff' }}>
        <h1 style={{ fontSize: 64, lineHeight: 1.05, textAlign: 'center' }}>
          {['WE BUILD', 'AWARD-WINNING', 'WEB EXPERIENCES'].map((t, i) => (
            <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
              <span className="hero-line" style={{ display: 'block' }}>
                {t}
              </span>
            </span>
          ))}
        </h1>
      </section>

      <section className="work" style={{ height: '100vh', overflow: 'hidden', background: '#222' }}>
        <div className="track" style={{ display: 'flex', height: '100vh', alignItems: 'center', gap: 24, padding: '0 40px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{ flex: '0 0 50vw', height: '70vh', background: `hsl(${i * 60} 70% 55%)`, borderRadius: 16 }}
            />
          ))}
        </div>
      </section>

      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center', color: '#fff' }}>
        <div className="footer-bg" style={{ position: 'absolute', inset: '-20% 0', background: 'linear-gradient(135deg,#f60,#60f)' }} />
        <h2 style={{ position: 'relative' }}>Let’s talk →</h2>
      </section>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">整页叙事</td><td className="px-2 py-1">Lenis + GSAP 同思路</td><td className="px-2 py-1">Lenis + GSAP（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">技术组合</td><td className="px-2 py-1">揭示 + pin + 视差</td><td className="px-2 py-1">同左</td></tr>
            <tr className="border-b"><td className="px-2 py-1">框架</td><td className="px-2 py-1">GSAP 框架无关</td><td className="px-2 py-1">GSAP 框架无关</td></tr>
            <tr className="border-b"><td className="px-2 py-1">用途</td><td className="px-2 py-1">营销 / 作品集站</td><td className="px-2 py-1">营销 / 作品集站</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：整页动画框架无关，React/Vue 思路一致；整合前面所有 anim 技术即成一个落地页。</p>
      </details>

    </main>
  )
}

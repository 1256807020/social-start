// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·滚动驱动篇）· GSAP ScrollTrigger + Lenis
// · Vue2/Vue3 对照：ScrollTrigger 框架无关，Vue 里同样 onMounted 注册、Lenis 滚动事件 update ScrollTrigger；
// · React 对照：useRef+useEffect 注册插件、Lenis.raf 驱动、卸载 ctx.revert()+lenis.destroy()（本例）。
// 📌 实战定位：滚动驱动动画【了解即可·进阶】；做「进入视口淡入 / 钉住 / 视差」必备，官网 / 营销页常见。
// 🧭 学习模式：🔧固定写法=ScrollTrigger.update 接 Lenis 滚动 + gsap.ticker 统一 raf；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
// 练习前在本分支运行：pnpm add gsap lenis
gsap.registerPlugin(ScrollTrigger)

/**
 * 核心组合：GSAP ScrollTrigger + Lenis 同步
 *  ScrollTrigger 让动画“由滚动驱动”（进入视口、钉住、scrub 进度、视差）。
 *  关键：用 Lenis 的滚动事件去 update ScrollTrigger，并用 gsap.ticker 统一驱动 raf。
 *  每个 👉 是给你手敲的练习点。
 */
export default function ScrollTriggerPage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update) // 👉 Lenis 滚动 → 通知 ScrollTrigger
    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    const ctx = gsap.context(() => {
      // 1. 进入视口淡入
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          scrollTrigger: { trigger: el, start: 'top 80%' },
        })
      })

      // 2. 钉住 + 顶部进度条（scrub 跟随滚动）
      gsap.to('.progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.pin',
          start: 'top top',
          end: '+=600',
          pin: true,
          scrub: true,
        },
      })

      // 3. 视差：背景慢速位移
      gsap.to('.bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: '.parallax', start: 'top bottom', end: 'bottom top', scrub: true },
      })

      // 👉 4. 水平滚动：pin 容器，把内层 x 从 0 移到 -(宽度-视口)
      // 👉 5. toggleActions / onEnter 回调做进/出场
      // 👉 6. ScrollTrigger.batch 批量处理多个元素的交错进场
    }, root)

    return () => {
      ctx.revert()
      lenis.destroy()
    }
  }, [])

  return (
    <main ref={root} style={{ fontFamily: 'system-ui' }}>
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <h1 className="reveal">向下滚动 ↓</h1>
      </div>

      <div className="reveal" style={{ padding: 40 }}>
        <h2>① 进入视口淡入</h2>
        <p>这段文本在滚入视口时淡入+上移。</p>
      </div>

      <section className="pin" style={{ height: '100vh', background: '#def', position: 'relative' }}>
        <div
          className="progress"
          style={{ position: 'absolute', top: 0, left: 0, height: 6, width: '100%', background: '#f60', transform: 'scaleX(0)', transformOrigin: 'left' }}
        />
        <h2 style={{ paddingTop: 40 }}>② 钉住 + 进度条（scrub）</h2>
      </section>

      <section className="parallax" style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div
          className="bg"
          style={{ position: 'absolute', inset: '-20% 0', background: 'linear-gradient(135deg,#fc6,#f6c)' }}
        />
        <h2 style={{ position: 'relative', padding: 40 }}>③ 视差层</h2>
      </section>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">滚动驱动</td><td className="px-2 py-1">ScrollTrigger（框架无关）</td><td className="px-2 py-1">ScrollTrigger（框架无关，本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">与 Lenis 同步</td><td className="px-2 py-1">lenis.on('scroll', ScrollTrigger.update)</td><td className="px-2 py-1">同左</td></tr>
            <tr className="border-b"><td className="px-2 py-1">能力</td><td className="px-2 py-1">进入视口 / 钉住 / scrub / 视差</td><td className="px-2 py-1">同左</td></tr>
            <tr className="border-b"><td className="px-2 py-1">清理</td><td className="px-2 py-1">onUnmounted revert+destroy</td><td className="px-2 py-1">useEffect 清理 revert+destroy</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：ScrollTrigger 框架无关；关键是把 Lenis 滚动接到 ScrollTrigger.update，并用 gsap.ticker 统一 raf。</p>
      </details>

    </main>
  )
}

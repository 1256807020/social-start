// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·滚动驱动篇）· GSAP ScrollTrigger + Lenis
// · Vue2/Vue3 对照：ScrollTrigger 框架无关，Vue 里同样 onMounted 注册、Lenis 滚动事件 update ScrollTrigger；
// · React 对照：useRef+useEffect 注册插件、Lenis.raf 驱动、卸载 ctx.revert()+lenis.destroy()（本例）。
// 📌 实战定位：滚动驱动动画【了解即可·进阶】；做「进入视口淡入 / 钉住 / 视差」必备，官网 / 营销页常见。
// 🧭 学习模式：🔧固定写法=ScrollTrigger.update 接 Lenis 滚动 + gsap.ticker 统一 raf；👉=练习点（①~③ 基础 + ④~⑥ 已补全为可运行案例）；文末 <details> 有 Vue2/Vue3/React 三向对照。
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
 *  ①~③ 为基础演示；④~⑥（水平滚动 / toggleActions 进出场 / batch 交错进场）已补全为可运行案例。
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
      const track = gsap.utils.toArray<HTMLElement>('.h-track')[0]
      if (track) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: '.h-section',
            start: 'top top',
            end: () => '+=' + (track.scrollWidth - window.innerWidth),
            pin: true,
            scrub: true,
            invalidateOnRefresh: true, // 尺寸变化时重算
          },
        })
      }

      // 👉 5. toggleActions / onEnter 回调做进/出场
      gsap.from('.toggle-box', {
        x: -220,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.toggle-section',
          start: 'top 70%',
          // toggleActions: "onEnter onLeave onEnterBack onLeaveBack"
          toggleActions: 'play none none reverse', // 进→播，回滚到顶→反播
          // 也可用回调精确控制：
          // onEnter: () => console.log('进入视口'),
          // onLeave: () => console.log('完全离开'),
          // onEnterBack: () => console.log('回滚进入'),
          // onLeaveBack: () => console.log('回滚离开'),
        },
      })

      // 👉 6. ScrollTrigger.batch 批量处理多个元素的交错进场
      ScrollTrigger.batch('.batch-card', {
        start: 'top 85%',
        onEnter: (batch) =>
          gsap.from(batch, {
            opacity: 0,
            y: 40,
            stagger: 0.15, // 逐个错开，形成交错进场
            duration: 0.6,
            overwrite: true,
          }),
        // onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, y: 40, overwrite: true }),
      })
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

      {/* ④ 水平滚动：钉住容器，内层横向平移 */}
      <section className="h-section" style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div className="h-track" style={{ display: 'flex', height: '100vh', width: 'max-content' }}>
          {['A', 'B', 'C', 'D', 'E'].map((c) => (
            <div
              key={c}
              style={{ flex: '0 0 60vw', height: '100vh', display: 'grid', placeItems: 'center', fontSize: 96, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#0af,#06c)', margin: '0 8px' }}
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* ⑤ toggleActions 进/出场 */}
      <section className="toggle-section" style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="toggle-box" style={{ width: 160, height: 160, background: '#f60', borderRadius: 16 }} />
      </section>

      {/* ⑥ ScrollTrigger.batch 交错进场 */}
      <section className="batch-section" style={{ padding: 40 }}>
        <h2>⑥ ScrollTrigger.batch 交错进场</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="batch-card" style={{ height: 120, background: 'linear-gradient(135deg,#6cf,#39c)', borderRadius: 8 }} />
          ))}
        </div>
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

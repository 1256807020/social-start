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
    </main>
  )
}

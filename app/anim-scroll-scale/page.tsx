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
      // 1. 滚动缩放：卡片随滚动从 0.6 放大到 1
      gsap.fromTo(
        '.scale-card',
        { scale: 0.6, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.scale-wrap', start: 'top 80%', end: 'top 30%', scrub: true },
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

      // 3. 多层视差：不同层不同速度
      gsap.to('.layer-back', { yPercent: -20, scrollTrigger: { scrub: true } })
      gsap.to('.layer-front', { yPercent: 20, scrollTrigger: { scrub: true } })

      // 👉 4. ScrollSmoother 思路：用 Lenis + 一个“内容包裹层”做整体缓冲
    }, root)
    return () => {
      ctx.revert()
      lenis.destroy()
    }
  }, [])

  return (
    <main ref={root} style={{ fontFamily: 'system-ui' }}>
      <section className="scale-wrap" style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="scale-card" style={{ width: 280, height: 200, background: '#48f', borderRadius: 16 }} />
      </section>

      <section className="h-scroll" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="track" style={{ display: 'flex', height: '100vh', alignItems: 'center', gap: 24, padding: '0 40px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ flex: '0 0 60vw', height: '70vh', background: `hsl(${i * 60} 70% 60%)`, borderRadius: 16 }} />
          ))}
        </div>
      </section>

      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div className="layer-back" style={{ position: 'absolute', inset: 0, background: '#fc6', opacity: 0.5 }} />
        <div className="layer-front" style={{ position: 'absolute', inset: '30%', background: '#f6c', opacity: 0.7 }} />
      </section>
    </main>
  )
}

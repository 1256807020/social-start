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
    </main>
  )
}

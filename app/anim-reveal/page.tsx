'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
// 练习前在本分支运行：pnpm add gsap lenis

/**
 * 核心组合：LineReveal / 文字逐行揭示 + 图片揭示
 *  获奖站最常见的“高级感”来源：元素被遮挡后平滑揭开。
 *  两个手法：① 行级包裹 overflow:hidden + 内部 translateY 100%→0；② clip-path 揭示图片。
 *  每个 👉 是给你手敲的练习点。
 */
export default function RevealPage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. 文字逐行揭示：每行包在 .line-mask（overflow:hidden）里，.line 从 y:100% 升上来
      gsap.from('.line', {
        yPercent: 100,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.headline', start: 'top 80%' },
      })

      // 2. 图片 clip-path 揭示
      gsap.fromTo(
        '.clip-img',
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: '.clip-img', start: 'top 85%' },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={root} style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1 className="headline" style={{ fontSize: 48, lineHeight: 1.1 }}>
        {['用 GSAP', '做出高级感', '逐行揭示'].map((t, i) => (
          <span key={i} className="line-mask" style={{ display: 'block', overflow: 'hidden' }}>
            <span className="line" style={{ display: 'block' }}>
              {t}
            </span>
          </span>
        ))}
      </h1>

      {/* 👉 多行文本用 SplitText（GSAP 官方插件，需授权）或第三方按行切；
          也可以手动在 JSX 里按 <br/> / 词拆分并套 .line-mask */}

      <div
        className="clip-img"
        style={{
          marginTop: 40,
          width: 320,
          height: 200,
          background: 'linear-gradient(135deg,#4f8,#48f)',
        }}
      />

      {/* 👉 进阶：mask-image 渐变揭示、SVG 路径描边揭示(stroke-dashoffset)、图片 scale+clip 组合 */}
    </main>
  )
}

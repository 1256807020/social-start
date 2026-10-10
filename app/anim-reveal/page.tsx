// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·揭示篇）· GSAP 逐行揭示 / clip-path
// · Vue2/Vue3 对照：揭示动画在 Vue 里用 &lt;transition&gt; JS 钩子 + GSAP/Lenis 同样能做（框架无关）；纯 Vue 可用 overflow:hidden + translateY 过渡；
// · React 对照：本例用 GSAP + ScrollTrigger 做逐行 yPercent 揭示、clip-path 图片揭示，useEffect 里 context 清理。
// 📌 实战定位：滚动揭示【了解即可·进阶】；获奖站“高级感”常用，营销 / 作品集页高频。
// 🧭 学习模式：🔧固定写法=overflow:hidden 包裹 + ScrollTrigger 触发；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">揭示手法</td><td className="px-2 py-1">overflow:hidden + translateY 过渡</td><td className="px-2 py-1">line-mask + ScrollTrigger</td></tr>
            <tr className="border-b"><td className="px-2 py-1">触发</td><td className="px-2 py-1">transition JS 钩子</td><td className="px-2 py-1">scrollTrigger 进视口</td></tr>
            <tr className="border-b"><td className="px-2 py-1">图片揭示</td><td className="px-2 py-1">clip-path + GSAP</td><td className="px-2 py-1">clip-path + GSAP（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">框架</td><td className="px-2 py-1">GSAP 可选</td><td className="px-2 py-1">GSAP 框架无关</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：揭示 = 溢出遮挡 + 位移；Vue 用 transition 钩子或 GSAP，React 本例用 GSAP + ScrollTrigger。</p>
      </details>

    </main>
  )
}

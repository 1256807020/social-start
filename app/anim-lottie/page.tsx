// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Lottie 篇）· 矢量 JSON 动画
// · Vue2/Vue3 对照：vue3-lottie 同样包一层 lottie-web；React 常用 lottie-react（即 lottie-web 的封装）。
// · React 对照：本例直接用底层引擎 lottie-web —— lottie.loadAnimation({container, animationData, loop, autoplay})，
//   再用返回的实例 play()/pause()/stop() 控制播放（最稳、最贴近本质的写法，Next16/React19 下稳定可见）。
// 📌 实战定位：品牌/运营矢量动效【了解即可·进阶】；直接导入 AE 导出的 Lottie JSON，体积小、与设计师无缝衔接，是品牌官网首选。
// 🧭 学习模式：🔧固定写法=import lottie from 'lottie-web'; lottie.loadAnimation({container, animationData, loop, autoplay}); 👉=练习点已填；文末对照。
// ⚠️ 说明：原 demo 用 lottie-react，但其 3.x 在 Next16/React19 下客户端渲染不稳定；这里改用其底层引擎 lottie-web，效果一致且更可靠。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'
import animationData from './animation.json'
// 实战中把 animationData 换成设计师从 After Effects 导出的 .json / .lottie 即可

export default function LottiePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let anim: AnimationItem | null = null
    // 动态 import：避免 SSR 阶段访问 window/document 导致客户端渲染失败
    import('lottie-web').then((mod) => {
      if (cancelled || !containerRef.current) return
      anim = mod.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      })
      animRef.current = anim
    })
    return () => {
      cancelled = true
      anim?.destroy()
      animRef.current = null
    }
  }, [])

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Lottie：矢量 JSON 动画</h1>
      <p>下方是内联的最小 Lottie（旋转蓝圆）。实战把 animationData 换成 AE 导出的品牌动效即可。</p>
      <div ref={containerRef} style={{ width: 240, height: 240 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {/* 👉 用实例控制播放时机：这正是「Lottie + GSAP/其他元素」联动时序的入口 */}
        <button onClick={() => animRef.current?.play()}>播放</button>
        <button onClick={() => animRef.current?.pause()}>暂停</button>
        <button onClick={() => animRef.current?.stop()}>停止</button>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">库</td><td className="px-2 py-1">vue3-lottie</td><td className="px-2 py-1">lottie-web（lottie-react 的底层封装）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">数据</td><td className="px-2 py-1">animationData / path</td><td className="px-2 py-1">animationData（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">控制</td><td className="px-2 py-1">组件 ref</td><td className="px-2 py-1">实例 play()/pause()/stop()</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Lottie 解决「设计师产出 ↔ 前端还原」断层；配合 GSAP 可补 Lottie 自身交互弱的短板（控制播放时序）。</p>
      </details>
    </main>
  )
}

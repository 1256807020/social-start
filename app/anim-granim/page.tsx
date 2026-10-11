// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Granim.js 篇）· 画布流动渐变
// · Vue2/Vue3 对照：Granim.js 框架无关，Vue 里 onMounted new Granim({element:'#c',states})；用法与 React 一致。
// · React 对照：useRef + useEffect 里 new Granim({element:'#granim-canvas', states:{...}}) 在 canvas 上画流动渐变（本例）。
// 📌 实战定位：画布渐变背景【了解即可·进阶】；在 <canvas> 上画可交互的流动渐变，与 AOS 组合低成本提升落地页质感。
// 🧭 学习模式：🔧固定写法=import Granim from 'granim'; new Granim({element:'#id',states:{'default-state':{gradients:[[c1,c2],...],transitionSpeed}}}); 👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import Granim from 'granim'
// 练习前在本分支运行：pnpm add granim

export default function GranimPage() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const granim = new Granim({
      element: '#granim-canvas', // 👉 必须是 canvas 的 id 或 DOM 节点
      direction: 'diagonal',
      isStretched: true,
      states: {
        'default-state': {
          gradients: [
            ['#ff5e62', '#ff9966'], // 👉 第一组渐变
            ['#36d1dc', '#5b86e5'], // 👉 第二组渐变（自动循环过渡）
          ],
          transitionSpeed: 3000,
        },
      },
    })
    return () => {
      granim.destroy?.() // 👉 清理
    }
  }, [])

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Granim.js：画布流动渐变</h1>
      <p>下方 canvas 由 Granim 持续绘制流动渐变（对比 Grim.js 它画在 canvas 上、可做图像渐变遮罩）。</p>
      <canvas
        id="granim-canvas"
        ref={ref}
        style={{ width: '100%', height: 260, borderRadius: 12, display: 'block' }}
      />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">库</td><td className="px-2 py-1">Granim.js</td><td className="px-2 py-1">Granim.js（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">载体</td><td className="px-2 py-1">&lt;canvas&gt;</td><td className="px-2 py-1">&lt;canvas&gt;（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">组合</td><td className="px-2 py-1">AOS+Granim</td><td className="px-2 py-1">AOS+Granim（同思路）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Granim 在 canvas 上画流动渐变，适合做 hero 背景；与 Grim.js 相比更偏「画布图像渐变」能力。</p>
      </details>
    </main>
  )
}

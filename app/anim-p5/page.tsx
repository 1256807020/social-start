// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·p5.js 篇）· 创意编程
// · Vue2/Vue3 对照：p5.js 框架无关，Vue 里 onMounted new p5(sketch, el)；React 用 useRef 容器 + useEffect 同样接法（本例）。
// · React 对照：useEffect 里 new p5(sketch, ref.current)，sketch 内 p.setup/p.draw 画 Canvas，卸载 inst.remove() 清理。
// 📌 实战定位：生成式 / 艺术向创意动效【了解即可·进阶】；p5 负责 Canvas 原生图形，配 Anime.js 做序列编排，做艺术站。
// 🧭 学习模式：🔧固定写法=import p5 from 'p5'; new p5((p)=>{p.setup=…;p.draw=…}, ref.current); 👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import type { p5 as P5Type } from 'p5'
// 练习前在本分支运行：pnpm add p5 @types/p5
// p5 是纯浏览器库，顶层 import 会在 SSR 阶段访问 window 直接 500，故在 useEffect 内动态 import。

export default function P5Page() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let inst: P5Type | null = null
    let cancelled = false
    // 动态 import：避免 SSR 阶段访问 window/document 导致整页 500
    import('p5').then((mod) => {
      if (cancelled || !ref.current) return
      const P5Ctor = mod.default
      const sketch = (p: P5Type) => {
        p.setup = () => {
          p.createCanvas(420, 300) // 👉 画布尺寸
          p.noStroke()
        }
        p.draw = () => {
          p.background(11, 16, 32)
          p.fill(72, 143, 255)
          p.ellipse(p.mouseX, p.mouseY, 60, 60) // 👉 跟随鼠标的圆
          p.fill(244, 77, 103)
          const s = 40 + 20 * Math.sin(p.frameCount * 0.05) // 👉 呼吸方块
          p.rect(p.width / 2 - s / 2, p.height / 2 - s / 2, s, s)
        }
      }
      inst = new P5Ctor(sketch, ref.current)
    })
    return () => {
      cancelled = true
      inst?.remove() // 👉 务必清理，否则切分支会残留实例
    }
  }, [])

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>p5.js：创意编程</h1>
      <p>下方 Canvas 由 p5 绘制：圆跟随鼠标、方块呼吸缩放（Canvas 原生图形 + 逐帧循环）。</p>
      <div ref={ref} style={{ borderRadius: 12, overflow: 'hidden', width: 'fit-content' }} />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">接入</td><td className="px-2 py-1">onMounted new p5</td><td className="px-2 py-1">useEffect new p5</td></tr>
            <tr className="border-b"><td className="px-2 py-1">循环</td><td className="px-2 py-1">draw()</td><td className="px-2 py-1">draw()（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">清理</td><td className="px-2 py-1">.remove()</td><td className="px-2 py-1">.remove()（一致）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：p5 把「逐帧 Canvas 创作」门槛拉到最低；与 Anime.js 组合（p5 画图形、Anime.js 编排时序）是创意编程经典搭配。</p>
      </details>
    </main>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Anime.js v4 篇）· 轻量 2D 补间
// · Vue2/Vue3 对照：Anime.js 框架无关，Vue 里 onMounted 调 animate(targets,{…})；用法与 React 完全一致。
// · React 对照：useEffect / 事件里 animate('.sel',{x,rotate,duration,ease})；v4 新增 Adapters 还能直接控 Three.js Mesh（本例只演示 DOM/SVG）。
// 📌 实战定位：轻量复杂 2D 动效【了解即可·进阶】；v4 模块化 tree-shaking 后体积极小，3000 元素仍能 60fps，是小体量项目首选。
// 🧭 学习模式：🔧固定写法=import {animate,stagger} from 'animejs'; animate('.sel',{x:200,rotate:'1turn',duration,ease})；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { animate, stagger } from 'animejs'
// 练习前在本分支运行：pnpm add animejs

export default function AnimejsPage() {
  // 👉 1. 位移到 + 旋转一圈
  const playTranslate = () => animate('.aj-box', { x: 220, rotate: '1turn', duration: 1000, ease: 'inOutSine' })
  // 👉 2. 交错进场（from→to 数组）
  const playStagger = () =>
    animate('.aj-item', { y: [0, -30], opacity: [0, 1], delay: stagger(100), duration: 600, ease: 'outQuad' })
  // 👉 3. 循环脉冲
  const playLoop = () =>
    animate('.aj-pulse', { scale: [1, 1.3], duration: 800, loop: true, alternate: true, ease: 'inOutQuad' })
  // 👉 4. 复位
  const reset = () => animate(['.aj-box', '.aj-item', '.aj-pulse'], { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 500 })

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Anime.js v4：轻量 2D 补间</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={playTranslate}>位移+旋转</button>
        <button onClick={playStagger}>交错进场</button>
        <button onClick={playLoop}>循环脉冲</button>
        <button onClick={reset}>复位</button>
      </div>

      <div className="aj-box" style={{ width: 80, height: 80, background: '#4f8', margin: '8px 0' }} />
      <ul style={{ display: 'flex', gap: 8, padding: 0, listStyle: 'none' }}>
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="aj-item" style={{ width: 48, height: 48, background: '#48f', opacity: 0 }} />
        ))}
      </ul>
      <div className="aj-pulse" style={{ width: 70, height: 70, background: '#f48', borderRadius: '50%', marginTop: 12 }} />

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">入口</td><td className="px-2 py-1">onMounted</td><td className="px-2 py-1">useEffect / 事件</td></tr>
            <tr className="border-b"><td className="px-2 py-1">API</td><td className="px-2 py-1">animate('.sel',{…})</td><td className="px-2 py-1">animate('.sel',{…})（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">v4 亮点</td><td className="px-2 py-1">Adapters 控 Three Mesh</td><td className="px-2 py-1">同左</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Anime.js v4 体积极小、性能强，且能直接驱动 Three.js 的 Mesh 属性；与 GSAP 互为轻/重替代，小项目选它更省体积。</p>
      </details>
    </main>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Motion One 篇）· 轻量 WAAPI
// · Vue2/Vue3 对照：Motion One 框架无关，Vue 里同样 animate('.sel',{…})；基于 Web Animations API，包体极小。
// · React 对照：事件里 animate(targets, keyframes, {duration,easing,delay:stagger})；和 GSAP 调用很像但更轻（本例）。
// 📌 实战定位：极致轻量落地页动效【了解即可·进阶】；基于 WAAPI，包体极小、性能强，适合对加载速度极敏感的页面。
// 🧭 学习模式：🔧固定写法=import {animate,stagger} from 'motion'; animate('.sel',{transform:['translateX(0)','translateX(220px)'],rotate:'360deg'},{duration:1,easing})；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { animate, stagger } from 'motion'
// 练习前在本分支运行：pnpm add motion

export default function MotionOnePage() {
  // 👉 1. 位移 + 旋转（WAAPI 用字符串关键帧）
  const playMove = () =>
    animate('.mo-box', { transform: ['translateX(0)', 'translateX(220px)'], rotate: '360deg' }, { duration: 1, easing: 'ease-in-out' })
  // 👉 2. 交错进场
  const playStagger = () =>
    animate(
      '.mo-item',
      { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
      { delay: stagger(0.1), duration: 0.6, easing: 'ease-out' }
    )
  // 👉 3. 复位
  const reset = () =>
    animate(['.mo-box', '.mo-item'], { opacity: 1, transform: 'translateX(0) translateY(0) rotate(0deg)' }, { duration: 0.4 })

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Motion One：轻量 WAAPI 动效</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={playMove}>位移+旋转</button>
        <button onClick={playStagger}>交错进场</button>
        <button onClick={reset}>复位</button>
      </div>
      <div className="mo-box" style={{ width: 80, height: 80, background: '#4f8', margin: '8px 0' }} />
      <ul style={{ display: 'flex', gap: 8, padding: 0, listStyle: 'none' }}>
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="mo-item" style={{ width: 48, height: 48, background: '#48f', opacity: 0 }} />
        ))}
      </ul>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">库</td><td className="px-2 py-1">Motion One（框架无关）</td><td className="px-2 py-1">Motion One（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">底层</td><td className="px-2 py-1">Web Animations API</td><td className="px-2 py-1">Web Animations API</td></tr>
            <tr className="border-b"><td className="px-2 py-1">体积</td><td className="px-2 py-1">极小</td><td className="px-2 py-1">极小</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Motion One = Motion 的 vanilla WAAPI 版，包体比 GSAP/anime 更小；简单 DOM 动效首选，复杂时间轴仍用 GSAP。</p>
      </details>
    </main>
  )
}

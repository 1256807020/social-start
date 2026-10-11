// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·GSAP Flip 篇）· 布局过渡
// · Vue2/Vue3 对照：Vue 用 <transition-group> + FLIP 思路做列表重排；GSAP Flip 把「记录旧态→改 DOM→动画到新态」自动化。
// · React 对照：Flip.getState(selector) 记录位置，改状态后 Flip.from(state,…) 自动补间到新布局（本例）。
// 📌 实战定位：布局/列表重排动画【了解即可·进阶】；卡片网格↔列表、拖拽排序、加项动画的工业级方案。
// 🧭 学习模式：🔧固定写法=const s=Flip.getState('.item'); 改 DOM/状态; Flip.from(s,{duration,ease,absolute:true})；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
gsap.registerPlugin(Flip) // 👉 注册 Flip 插件
// 练习前在本分支运行：pnpm add gsap

export default function FlipPage() {
  const [grid, setGrid] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  function toggle() {
    if (!container.current) return
    const state = Flip.getState('.flip-item') // 👉 1. 记录当前每个 item 的位置/尺寸
    setGrid((v) => !v) // 👉 2. 切换布局（grid ↔ flex），React 提交后 DOM 变化
    requestAnimationFrame(() => {
      // 👉 3. 从旧态动画到新布局；absolute 让元素脱离文档流避免跳动
      Flip.from(state, { duration: 0.6, ease: 'power2.inOut', absolute: true })
    })
  }

  const items = [1, 2, 3, 4, 5, 6]

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>GSAP Flip：布局过渡动画</h1>
      <button onClick={toggle} style={{ padding: '8px 16px', marginBottom: 16 }}>
        切换 {grid ? '网格 → 列表' : '列表 → 网格'}
      </button>
      <div
        ref={container}
        style={{
          display: grid ? 'grid' : 'flex',
          flexWrap: 'wrap',
          gap: 12,
          gridTemplateColumns: grid ? 'repeat(3, 1fr)' : undefined,
        }}
      >
        {items.map((i) => (
          <div
            key={i}
            className="flip-item"
            style={{
              width: grid ? 'auto' : 120,
              height: 80,
              background: '#48f',
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
            }}
          >
            卡片 {i}
          </div>
        ))}
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">重排动画</td><td className="px-2 py-1">&lt;transition-group&gt; FLIP</td><td className="px-2 py-1">GSAP Flip（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">核心</td><td className="px-2 py-1">记录旧位→新位补间</td><td className="px-2 py-1">Flip.getState→Flip.from（一致）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：FLIP（First-Last-Invert-Play）是布局动画的通用思路；GSAP Flip 把它封装成一行 API，不必手写测量。</p>
      </details>
    </main>
  )
}

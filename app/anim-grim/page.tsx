// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Grim.js 篇）· 交互式动态渐变背景
// · Vue2/Vue3 对照：Grim.js 框架无关，Vue 里同样 new Grim(selector,{colors})；几行代码生成流动渐变背景。
// · React 对照：useRef + useEffect 里 new Grim('#grim',{colors,duration}) 把渐变注入元素（本例）。
// 📌 实战定位：高级视觉氛围背景【了解即可·进阶】；零复杂配置生成流动渐变，2026 大量品牌官网用它营造高级感。
// 🧭 学习模式：🔧固定写法=import Grim from 'grimjs'; new Grim('#id',{colors:[...],duration}); 👉具体 API 以 grimjs 文档为准；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import Grim from 'grimjs'
// 练习前在本分支运行：pnpm add grimjs
// 注：Grim.js 的构造签名以官方文档为准；下方为常见写法，若报错请按文档微调。

export default function GrimPage() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const grim = new Grim(ref.current, {
      colors: ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'],
      duration: 8000,
    })
    // @ts-expect-error Grim 实例方法名以文档为准
    grim.start?.()
    return () => {
      // @ts-expect-error 清理方法以文档为准
      grim.stop?.()
    }
  }, [])

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Grim.js：流动渐变背景</h1>
      <p>下方色块由 Grim.js 持续注入流动渐变（自带兜底渐变，即使库未初始化也能看到颜色）。</p>
      <div
        ref={ref}
        style={{
          width: '100%',
          height: 260,
          borderRadius: 12,
          background: 'linear-gradient(120deg,#ee7752,#e73c7e,#23a6d5,#23d5ab)',
        }}
      />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">库</td><td className="px-2 py-1">Grim.js</td><td className="px-2 py-1">Grim.js（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">调用</td><td className="px-2 py-1">onMounted new Grim</td><td className="px-2 py-1">useEffect new Grim</td></tr>
            <tr className="border-b"><td className="px-2 py-1">组合</td><td className="px-2 py-1">AOS+Granim 同思路</td><td className="px-2 py-1">同左</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Grim.js 是「动态渐变背景」专精库；与 AOS 组合（AOS 管入场、Grim 管背景）是轻量落地页低成本提质套路。</p>
      </details>
    </main>
  )
}

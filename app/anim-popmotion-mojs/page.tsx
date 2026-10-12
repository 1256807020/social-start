// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Popmotion + Mo.js 篇）· 创意特效组合
// · Vue2/Vue3 对照：Popmotion / Mo.js 都框架无关，Vue 里同样 onMounted 初始化；用法与 React 一致。
// · React 对照：Popmotion 做手势驱动的位移（animate({from,to,onUpdate})）；Mo.js 做点击粒子爆发（本例）。
// 📌 实战定位：高互动创意特效【了解即可·进阶】；Popmotion 处理拖拽/滑动物理动效，Mo.js 生成粒子/形状变形，做品牌创意站。
// 🧭 学习模式：🔧固定写法=import {animate} from 'popmotion'; animate({from,to,onUpdate:v=>el.style.transform}); Mo.js 依赖 window，须在 useEffect 内 import('mo-js') 动态取 default 再 new Mojs.Burst({...}).replay()；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'popmotion'
// @ts-ignore mo-js 无官方类型声明，且它只在浏览器可用（模块顶层访问 window），
// 故不写顶层 import，改在 useEffect 内 import('mo-js') 动态取 default，避免 SSR 阶段 window is not defined。
// 练习前在本分支运行：pnpm add popmotion mo-js

// mo-js 无官方类型，这里补最小可用类型（避免 any）
type MojsBurst = { tune: (o: Record<string, number>) => MojsBurst; replay: () => void }
type MojsModule = { Burst: new (opts: Record<string, unknown>) => MojsBurst }

export default function PopmotionMojsPage() {
  const ballRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const burstRef = useRef<MojsBurst | null>(null)

  useEffect(() => {
    // 👉 Mo.js 浏览器专属：服务端无 window，必须客户端动态 import（否则 SSR 报 window is not defined）
    let burst: MojsBurst | null = null
    let cleanup: (() => void) | null = null

    // @ts-ignore mo-js 无类型声明（动态 import，仅浏览器执行）
    import('mo-js').then((mod) => {
      const Mojs = mod.default as unknown as MojsModule
      burst = new Mojs.Burst({
        left: 0,
        top: 0,
        radius: { 0: 120 },
        count: 12,
        children: {
          shape: 'circle',
          fill: ['#48f', '#f48', '#4f8'],
          radius: 10,
          duration: 1000,
        },
      })
      burstRef.current = burst

      const wrap = wrapRef.current
      const onClick = (e: MouseEvent) => {
        const r = wrap?.getBoundingClientRect()
        if (!r) return
        burst?.tune({ x: e.clientX - r.left, y: e.clientY - r.top }).replay() // 👉 在点击位置播放
      }
      wrap?.addEventListener('click', onClick)
      cleanup = () => wrap?.removeEventListener('click', onClick)
    })

    return () => {
      cleanup?.()
      burst = null
      burstRef.current = null
    }
  }, [])

  // 👉 Popmotion：手势/按钮驱动小球位移（物理缓动）
  const moveBall = () => {
    if (!ballRef.current) return
    animate({
      from: 0,
      to: 240,
      onUpdate: (v: number) => {
        if (ballRef.current) ballRef.current.style.transform = `translateX(${v}px)`
      },
    })
  }

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Popmotion + Mo.js：创意特效</h1>
      <button onClick={moveBall} style={{ padding: '8px 16px', marginBottom: 12 }}>
        Popmotion 移动小球
      </button>
      <div ref={ballRef} style={{ width: 60, height: 60, background: '#4f8', borderRadius: '50%' }} />
      <p className="mt-4">下方区域点击任意处 → Mo.js 粒子爆发：</p>
      <div
        ref={wrapRef}
        style={{ width: '100%', height: 240, background: '#0b1020', borderRadius: 12, cursor: 'crosshair' }}
      />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">物理动效</td><td className="px-2 py-1">Popmotion</td><td className="px-2 py-1">Popmotion（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">粒子</td><td className="px-2 py-1">Mo.js</td><td className="px-2 py-1">Mo.js（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">组合</td><td className="px-2 py-1">p5+anime 同类思路</td><td className="px-2 py-1">p5+anime 同类思路</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Popmotion 管「手势/数值驱动的物理动效」、Mo.js 管「粒子/形状爆发」；二者组合是品牌创意站的经典特效栈。</p>
      </details>
    </main>
  )
}

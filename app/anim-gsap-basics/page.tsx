// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·核心篇）· GSAP
// · Vue2/Vue3 对照：GSAP 框架无关，Vue 里 onMounted 初始化、onUnmounted ctx.revert()；用法与 React 完全一致；
// · React 对照：useRef 拿根 + useEffect 里 gsap.context(...,root)、卸载 ctx.revert()（本例）。
// 📌 实战定位：JS 动画【了解即可·进阶】；GSAP 是动画天花板，时间线 / 滚动驱动 / 跨浏览器一致；和 CSS 动画互补。
// 🧭 学习模式：🔧固定写法=gsap.to/from/timeline + gsap.context 清理；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
// 练习前在本分支运行：pnpm add gsap lenis

/** 缓动大全示例用到的 ease 清单（JS 动画与 JSX 渲染共用，保证顺序一致） */
const EASES = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'circ.out',
  'expo.out',
  'back.out(2)',
  'elastic.out(1, 0.3)',
  'bounce.out',
]

/**
 * 地基②：GSAP 核心（Tween / Timeline / Stagger / Ease）
 *  GSAP 是 JS 动画天花板：时间线编排 + 滚动驱动 + 跨浏览器一致。
 *  记住核心 API：gsap.to / gsap.from / gsap.timeline / stagger / ease。
 *  每个 👉 是给你手敲的练习点。用 gsap.context 包住，卸载时 ctx.revert() 清理。
 */
export default function GsapBasicsPage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 进场：标题淡入上移
      gsap.from('.hero', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' })

      // 👉 1. 基础 tween：gsap.to('.box', { x: 120, rotation: 90, duration: 1, ease: 'power2.out' })
      // 👉 2. 时间线编排：const tl = gsap.timeline({ defaults: { duration: 0.6 } }); tl.to(a,{x:100}).to(b,{y:100}).to(c,{scale:1.2})
      // 👉 3. 交错：gsap.from('.item', { y: 30, opacity: 0, stagger: 0.1, ease: 'back.out(1.7)' })
      // 👉 4. 循环：gsap.to('.spin', { rotation: 360, repeat: -1, duration: 2, ease: 'none' })
      // 👉 5. 缓动大全：power1..4、expo、circ、back、elastic、bounce

      /* ========== 完整实现：把上面 5 个练习点全部跑通 ========== */

      // ① 基础 tween —— 移动 + 旋转 .box（delay 让它在 hero 之后登场）
      gsap.fromTo(
        '.box',
        { x: 0, rotation: 0 },
        { x: 140, rotation: 90, duration: 1.2, ease: 'power2.out', delay: 0.3 },
      )

      // ② 时间线编排 —— 依次驱动 a → b → c（defaults 统一时长 / 缓动）
      const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' }, delay: 0.4 })
      tl.to('.tl-a', { x: 110 })
        .to('.tl-b', { y: 70 })
        .to('.tl-c', { scale: 1.3, rotation: 180 })

      // ③ 交错 stagger —— 4 个 .item 依次淡入上移（back 缓动带回弹）
      gsap.from('.item', {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        ease: 'back.out(1.7)',
        delay: 0.5,
      })

      // ④ 循环旋转 —— .spin 持续匀速转圈（repeat:-1 + ease:none）
      gsap.to('.spin', { rotation: 360, repeat: -1, duration: 2, ease: 'none' })

      // ⑤ 缓动大全 —— 每个 ease 盒子走同一段位移并往返循环，直观对比手感
      EASES.forEach((ease, i) => {
        gsap.to(`.ease-${i}`, {
          x: 180,
          duration: 1.6,
          ease,
          repeat: -1,
          yoyo: true,
          repeatDelay: 0.4,
          delay: i * 0.04,
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={root} className="mx-auto max-w-3xl space-y-10 p-10 font-sans">
      <h1 className="hero text-2xl font-bold">GSAP 核心 · 完整例子</h1>

      {/* ① 基础 tween */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">① 基础 tween（gsap.to / fromTo）</h2>
        <div className="box h-20 w-20 rounded bg-emerald-400" />
      </section>

      {/* ② 时间线编排 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">② 时间线编排（timeline 顺序串联）</h2>
        <div className="flex gap-3">
          <div className="tl-a h-12 w-12 rounded bg-sky-400" />
          <div className="tl-b h-12 w-12 rounded bg-indigo-400" />
          <div className="tl-c h-12 w-12 rounded bg-violet-400" />
        </div>
      </section>

      {/* ③ 交错 stagger */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">③ 交错 stagger（逐个进场）</h2>
        <ul className="flex gap-3 p-0">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="item h-10 w-10 list-none rounded bg-blue-500" />
          ))}
        </ul>
      </section>

      {/* ④ 循环旋转 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">④ 循环旋转（repeat: -1）</h2>
        {/* 用带白点的方块：实心圆旋转对称看不出转，方块+偏置白点能看清绕圈 */}
        <div className="spin relative h-16 w-16 rounded-lg bg-pink-400">
          <span className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-white" />
        </div>
      </section>

      {/* ⑤ 缓动大全 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">⑤ 缓动大全（ease 横向对比）</h2>
        <div className="flex flex-col gap-2">
          {EASES.map((e, i) => (
            <div key={e} className="flex items-center gap-3">
              <code className="w-44 shrink-0 text-xs text-gray-500">{e}</code>
              <div className={`ease-${i} h-6 w-6 rounded bg-amber-400`} />
            </div>
          ))}
        </div>
      </section>

      <details className="rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2 / Vue3</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">动画库</td>
              <td className="px-2 py-1">GSAP（框架无关）</td>
              <td className="px-2 py-1">GSAP（框架无关，本例）</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">初始化</td>
              <td className="px-2 py-1">onMounted</td>
              <td className="px-2 py-1">useEffect + useRef(root)</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">核心 API</td>
              <td className="px-2 py-1">gsap.to/from/timeline</td>
              <td className="px-2 py-1">gsap.to/from/timeline</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">清理</td>
              <td className="px-2 py-1">onUnmounted ctx.revert()</td>
              <td className="px-2 py-1">useEffect 清理 ctx.revert()</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">
          📝 小结：GSAP 框架无关，React/Vue 写法一致；用 gsap.context 包裹便于统一清理。
          本页 5 段（tween / timeline / stagger / loop / ease）已一次性跑通，刷新即重看。
        </p>
      </details>
    </main>
  )
}

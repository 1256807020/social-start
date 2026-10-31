// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·声明式篇）· Framer Motion (motion)
// · Vue2/Vue3 对照：Vue 用内置 &lt;transition&gt; / &lt;TransitionGroup&gt; 做进出场，或 JS 钩子做复杂动画；没有 Framer Motion 这类「声明式动画库」；
// · React 对照：Framer Motion 把动画写进 initial/animate/exit，和渲染同频（声明式），AnimatePresence 管卸载动画（本例）。
// 📌 实战定位：应用型 UI 动画【了解即可·进阶】；列表进出 / 布局切换 / 路由过渡首选 Framer Motion，营销叙事用 GSAP。
// 🧭 学习模式：🔧固定写法=motion.div initial/animate/exit + AnimatePresence；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
// 练习前在本分支运行：pnpm add framer-motion

/**
 * React / Next 主流动画方案（与 GSAP 双轨）
 *  架构师视角：
 *   - 营销/滚动叙事站 → GSAP + Lenis（见 anim-* 系列）
 *   - 应用型 UI（列表进出、布局切换、路由过渡）→ Framer Motion（现名 motion）+ View Transitions API
 *  Framer Motion 是“声明式”：把动画写进组件的 initial/animate/exit，和 React 渲染同频。
 *  每个 👉 是给你手敲的练习点。
 */
export default function ReactMotionPage() {
  const [open, setOpen] = useState(false)
  const [show2, setShow2] = useState(true)
  const [big, setBig] = useState(false)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, -260]) // 👉 滚动驱动位移（幅度加大更易见）
  const op = useTransform(scrollY, [0, 600], [1, 0.3]) // 👉 滚动同时淡出

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui', minHeight: '200vh' }}>
      <h1>React / Next 主流动画：Framer Motion</h1>

      {/* 1. 进场 + 退出（AnimatePresence 管理卸载动画） */}
      <button onClick={() => setOpen((v) => !v)}>切换</button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ padding: 20, background: '#def', marginTop: 12 }}
          >
            我会淡入淡出
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 变体（variants）批量编排子元素 —— 点按钮重播交错进场 */}
      <button onClick={() => setShow2((v) => !v)}>重播交错</button>
      <motion.ul
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } } }}
        initial="hidden"
        animate={show2 ? 'show' : 'hidden'}
        style={{ display: 'flex', gap: 8, padding: 0 }}
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.li
            key={i}
            variants={{ hidden: { opacity: 0, y: 30, scale: 0.6 }, show: { opacity: 1, y: 0, scale: 1 } }}
            style={{ listStyle: 'none', width: 40, height: 40, background: '#48f', borderRadius: 8 }}
          />
        ))}
      </motion.ul>

      {/* 3. 布局动画：layout 属性自动补间尺寸变化 —— 点按钮看补间 */}
      <button onClick={() => setBig((v) => !v)}>切换尺寸</button>
      <motion.div layout style={{ marginTop: 20, padding: 20, background: '#fec', display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.div layout style={{ width: big ? 200 : 80, height: big ? 200 : 80, background: '#f88', borderRadius: 12 }} />
        <motion.div layout style={{ width: big ? 60 : 120, height: big ? 120 : 60, background: '#8f8', borderRadius: 12 }} />
      </motion.div>

      {/* 4. 滚动驱动（useScroll + useTransform） —— 向下滚动看上移+淡出 */}
      <motion.div style={{ y, opacity: op, marginTop: 40, padding: 20, background: '#efe' }}>
        我随滚动上移并淡出
      </motion.div>

      {/* 👉 5. Next 路由过渡：用 View Transitions API 或 template.tsx 做页面切换动画
           👉 6. CSS / Tailwind 动画（@keyframes、transition）仍是最轻量首选 */}
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">声明式动画库</td><td className="px-2 py-1">无（用内置 transition）</td><td className="px-2 py-1">Framer Motion（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">进出场</td><td className="px-2 py-1">&lt;transition&gt; / &lt;TransitionGroup&gt;</td><td className="px-2 py-1">AnimatePresence + exit</td></tr>
            <tr className="border-b"><td className="px-2 py-1">滚动驱动</td><td className="px-2 py-1">无内置（用 GSAP）</td><td className="px-2 py-1">useScroll / useTransform</td></tr>
            <tr className="border-b"><td className="px-2 py-1">Vue 平替</td><td className="px-2 py-1">transition + GSAP</td><td className="px-2 py-1">Framer Motion / 或 GSAP</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Framer Motion 声明式，Vue 用内置 transition 或 GSAP；应用型 UI 动画首选 Framer Motion。</p>
      </details>

    </main>
  )
}

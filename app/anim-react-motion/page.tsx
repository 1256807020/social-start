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
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -100]) // 👉 滚动驱动位移

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

      {/* 2. 变体（variants）批量编排子元素 */}
      <motion.ul
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', gap: 8, padding: 0 }}
      >
        {[1, 2, 3].map((i) => (
          <motion.li
            key={i}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            style={{ listStyle: 'none', width: 40, height: 40, background: '#48f' }}
          />
        ))}
      </motion.ul>

      {/* 3. 布局动画：layout 属性自动补间位置变化 */}
      <motion.div layout style={{ marginTop: 20, padding: 20, background: '#fec' }}>
        <motion.div layout style={{ width: 80, height: 80, background: '#f88' }} />
      </motion.div>

      {/* 4. 滚动驱动（useScroll + useTransform） */}
      <motion.div style={{ y, marginTop: 40, padding: 20, background: '#efe' }}>
        我随滚动上移
      </motion.div>

      {/* 👉 5. Next 路由过渡：用 View Transitions API 或 template.tsx 做页面切换动画
           👉 6. CSS / Tailwind 动画（@keyframes、transition）仍是最轻量首选 */}
    </main>
  )
}

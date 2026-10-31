// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·React Bits 篇）· Motion 复刻经典 Bits
// · Vue2/Vue3 对照：没有直接对应；React Bits 是「复制粘贴即用」的动画组件站（46.6K★），本质是 framer-motion 的封装。
// · React 对照：下面用 framer-motion 的 useMotionValue/useSpring/useTransform 复刻 3 个经典 Bit：倾斜卡 / 渐变字 / 磁吸按钮（本例）。
// 📌 实战定位：应用型 UI 动效提速【了解即可·进阶】；Motion 给能力，React Bits 给现成组件，二者组合减少重复造轮子。
// 🧭 学习模式：🔧固定写法=useMotionValue + useSpring + useTransform 映射鼠标位置→rotate/translate；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
// 练习前在本分支运行：pnpm add framer-motion
// React Bits 组件来自 https://reactbits.dev ，这里用 Motion 手写等价实现，便于理解原理。

function TiltCard() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 15 })
  const sy = useSpring(y, { stiffness: 150, damping: 15 })
  const rotateX = useTransform(sy, [-0.5, 0.5], [15, -15]) // 👉 鼠标 Y → 绕 X 倾斜
  const rotateY = useTransform(sx, [-0.5, 0.5], [-15, 15]) // 👉 鼠标 X → 绕 Y 倾斜

  const onMove = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 600 }}
      className="p-6 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
    >
      悬浮我 → 3D 倾斜
    </motion.div>
  )
}

function GradientText() {
  return (
    <motion.h2
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{
        backgroundImage: 'linear-gradient(90deg,#48f,#f48,#4f8)',
        backgroundSize: '200%',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontSize: 36,
        fontWeight: 800,
      }}
    >
      React Bits · Gradient
    </motion.h2>
  )
}

function Magnet({ children }: { children: ReactNode }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })
  return (
    <motion.button
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) / 4) // 👉 磁吸偏移
        y.set((e.clientY - r.top - r.height / 2) / 4)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className="px-6 py-3 rounded-full bg-fuchsia-600 text-white"
    >
      {children}
    </motion.button>
  )
}

function TypeReveal() {
  const TEXT = 'Motion 让文字逐字浮现 ✦'
  return (
    <motion.h2
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
      style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.4, minHeight: 40 }}
    >
      {TEXT.split('').map((ch, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.h2>
  )
}

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const glow = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, rgba(99,102,241,0.35), rgba(99,102,241,0) 70%), #0b1020`
  const onMove = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      style={{
        background: glow,
        position: 'relative',
        height: 160,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#cbd5e1',
        border: '1px solid #1e293b',
        overflow: 'hidden',
      }}
    >
      悬浮我 → 光标光晕跟随
    </motion.div>
  )
}

export default function ReactBitsPage() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui', display: 'grid', gap: 24, maxWidth: 520 }}>
      <h1>Motion + React Bits（复刻 5 个经典 Bit）</h1>
      <TiltCard />
      <GradientText />
      <Magnet>磁吸按钮</Magnet>
      <TypeReveal />
      <CursorGlow />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">现成组件</td><td className="px-2 py-1">无直接对应</td><td className="px-2 py-1">React Bits（复制即用）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">底层</td><td className="px-2 py-1">—</td><td className="px-2 py-1">framer-motion + useMotionValue</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React Bits 把常用动效组件化；理解 useMotionValue/useSpring/useTransform 后，你也能自己写任意 Bit，不必依赖组件库。</p>
      </details>
    </main>
  )
}

// ───────────────────────────────────────────────────────────
// 路由过渡核心：template.tsx 在每次路由切换时重新挂载，
// 因此用 framer-motion 的 motion.div 包一层即可做「进场动画」。
// （App Router 没有内置「退出动画」，进场过渡用 template 最稳。）
'use client'

import { motion } from 'framer-motion'
// 练习前在本分支运行：pnpm add framer-motion

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // 👉 进场起点
      animate={{ opacity: 1, y: 0 }} // 👉 进场终点
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

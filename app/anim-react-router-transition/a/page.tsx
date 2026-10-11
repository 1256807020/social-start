'use client'

import Link from 'next/link'

// A 子页：从 hub 或 B 跳过来都会触发 template.tsx 的进场动画。
export default function PageA() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>A 页</h1>
      <p style={{ color: '#48f' }}>这里是 A 的内容区，进入时有淡入上移动画。</p>
      <Link href="/anim-react-router-transition" style={{ color: '#48f' }}>← 回 hub</Link>
      {' · '}
      <Link href="/anim-react-router-transition/b" style={{ color: '#48f' }}>去 B 页 →</Link>
    </main>
  )
}

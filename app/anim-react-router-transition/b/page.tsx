'use client'

import Link from 'next/link'

// B 子页：同上，进入时触发进场动画。
export default function PageB() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>B 页</h1>
      <p style={{ color: '#4f8' }}>这里是 B 的内容区，进入时有淡入上移动画。</p>
      <Link href="/anim-react-router-transition" style={{ color: '#48f' }}>← 回 hub</Link>
      {' · '}
      <Link href="/anim-react-router-transition/a" style={{ color: '#48f' }}>去 A 页 →</Link>
    </main>
  )
}

'use client'

import { useState } from 'react'

/**
 * 原生 HTML5 拖拽排序（搬运自 learning-demos 的 DragDropDemo）
 * 纯 React + DOM，无第三方库。
 * 每个 👉 是给你手敲的练习点。
 */
export default function DragDropPage() {
  const [items, setItems] = useState(['React', 'Vue', 'Svelte', 'Angular'])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // 👉 手敲思路：onDragStart 记录 dragIndex；onDragOver 必须 preventDefault 才允许 drop；onDrop 与目标交换
  function handleDrop(target: number) {
    if (dragIndex === null || dragIndex === target) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(target, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>原生拖拽排序</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((it, i) => (
          <li
            key={it}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            style={{
              padding: 12,
              margin: 4,
              background: dragIndex === i ? '#cde' : '#eee',
              cursor: 'grab',
            }}
          >
            {it}
          </li>
        ))}
      </ul>
    </main>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（拖拽篇）· 原生 HTML5 Drag & Drop
// · Vue2 对照：同样用 draggable + @dragstart/@dragover/@drop，onDragOver 要 preventDefault 才允许 drop，逻辑一致；
// · Vue3 对照：同 Vue2，&lt;script setup&gt; 里 ref + 事件绑定；
// · React 对照：draggable + onDragStart/onDragOver(preventDefault)/onDrop，setState 交换数组（本例）。
// 📌 实战定位：拖拽排序【了解即可·进阶】，简单排序用原生即可；复杂拖拽（跨容器/动画）上 dnd-kit。
// 🧭 学习模式：🔧固定写法=onDragOver 必 preventDefault + onDrop 交换；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">触发拖拽</td><td className="px-2 py-1">draggable + @dragstart</td><td className="px-2 py-1">draggable + @dragstart</td><td className="px-2 py-1">draggable + onDragStart（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">允许放置</td><td className="px-2 py-1">@dragover.prevent</td><td className="px-2 py-1">@dragover.prevent</td><td className="px-2 py-1">onDragOver 必须 preventDefault</td></tr>
            <tr className="border-b"><td className="px-2 py-1">放置处理</td><td className="px-2 py-1">@drop 交换</td><td className="px-2 py-1">@drop 交换</td><td className="px-2 py-1">onDrop 交换数组</td></tr>
            <tr className="border-b"><td className="px-2 py-1">推荐库</td><td className="px-2 py-1">vuedraggable</td><td className="px-2 py-1">vuedraggable(SortableJS)</td><td className="px-2 py-1">dnd-kit</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：原生 DnD 三框架写法一致；onDragOver 必须 preventDefault 才能 drop 是关键坑。</p>
      </details>

    </main>
  )
}

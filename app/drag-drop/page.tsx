// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（拖拽篇）· 原生 HTML5 Drag & Drop + 真实接口持久化（每框架一条 + order 字段）
// · Vue2 对照：同样用 draggable + @dragstart/@dragover/@drop，onDragOver 要 preventDefault 才允许 drop，逻辑一致；
// · Vue3 对照：同 Vue2，<script setup> 里 ref + 事件绑定；
// · React 对照：draggable + onDragStart/onDragOver(preventDefault)/onDrop，setState 交换数组（本例）。
// 📌 实战定位：拖拽排序【了解即可·进阶】，简单排序用原生即可；复杂拖拽（跨容器/动画）上 dnd-kit。
// 🧭 学习模式：🔧固定写法=onDragOver 必 preventDefault + onDrop 交换；本例进一步把顺序持久化到真实 /api/drop，
//   并充分利用基座能力：① GET /api/drop?sort=order 读取并按 order 排序；② 首次 batch-create 批量建 4 条；
//   ③ 拖拽后 batch-update 批量更新各条 order 字段——每条框架一条记录，刷新不丢，演示「拖拽 + 后端」。
//   基座特性：任意资源名自动建库（字母开头+字母数字_-），首次 batch-create 自动建 data/drop.json。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef, useState } from 'react'

type DropItem = { id: number; label: string; order: number }

const DEFAULT_ITEMS: Omit<DropItem, 'id'>[] = [
  { label: 'React', order: 0 },
  { label: 'Vue', order: 1 },
  { label: 'Svelte', order: 2 },
  { label: 'Angular', order: 3 },
]

/**
 * 原生 HTML5 拖拽排序（搬运自 learning-demos 的 DragDropDemo）+ 真实接口持久化
 * 纯 React + DOM，无第三方库；每条框架 = /api/drop 一条记录（含 order 字段），顺序存后端，刷新不丢。
 */
export default function DragDropPage() {
  const [items, setItems] = useState<DropItem[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const loaded = useRef(false)

  // 👉 加载已存顺序（利用基座 sort=order 排序查询）；首次访问则 batch-create 批量 seed 默认顺序
  useEffect(() => {
    if (loaded.current) return // StrictMode 双调用防护
    loaded.current = true
    ;(async () => {
      const load = async () =>
        (await (await fetch('/api/drop?sort=order')).json()) as {
          code: number
          data: DropItem[]
        }
      let j = await load()
      if (j.data.length === 0) {
        // 首次：batch-create 批量建 4 条（基座自动建 data/drop.json）
        await fetch('/api/drop/batch-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEFAULT_ITEMS),
        })
        j = await load() // 重新拉取（利用基座 sort=order 排序）
      }
      setItems(j.data)
    })().catch((e) => console.error('加载顺序失败', e))
  }, [])

  // 👉 onDragStart 记录 dragIndex；onDragOver 必 preventDefault；onDrop 交换并持久化
  function handleDrop(target: number) {
    if (dragIndex === null || dragIndex === target) return
    const from = dragIndex
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(target, 0, moved)
    // 重新分配 order（新下标即新顺序）
    const reordered = next.map((it, idx) => ({ ...it, order: idx }))
    setItems(reordered) // 乐观更新 UI
    // 👉 持久化：batch-update 一次性批量更新各条 order 字段（利用基座批量能力）
    fetch('/api/drop/batch-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reordered.map((it) => ({ id: it.id, order: it.order }))),
    }).catch((e) => console.error('保存顺序失败', e))
    setDragIndex(null)
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>原生拖拽排序（已接真实 /api/drop 持久化 · 每框架一条 + order）</h1>
      <p style={{ color: '#666' }}>
        拖动条目调整顺序，松手即写入后端（batch-update 批量存 order），刷新页面顺序不丢。
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((it, i) => (
          <li
            key={it.id}
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
            {it.label}
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
            <tr className="border-b"><td className="px-2 py-1">持久化</td><td className="px-2 py-1">手写 axios</td><td className="px-2 py-1">手写 axios</td><td className="px-2 py-1">GET?sort=order / batch-create / batch-update（本例）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：原生 DnD 三框架写法一致；onDragOver 必须 preventDefault 才能 drop 是关键坑。本例每条框架 = /api/drop 一条记录（含 order 字段），充分复用基座能力：GET ?sort=order 读取排序、首次 batch-create 批量建、拖拽后 batch-update 批量改 order，刷新不丢，演示「拖拽 + 后端」。</p>
      </details>

    </main>
  )
}

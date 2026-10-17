// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（拖拽篇）· 原生 HTML5 Drag & Drop + 真实接口持久化
// · Vue2 对照：同样用 draggable + @dragstart/@dragover/@drop，onDragOver 要 preventDefault 才允许 drop，逻辑一致；
// · Vue3 对照：同 Vue2，<script setup> 里 ref + 事件绑定；
// · React 对照：draggable + onDragStart/onDragOver(preventDefault)/onDrop，setState 交换数组（本例）。
// 📌 实战定位：拖拽排序【了解即可·进阶】，简单排序用原生即可；复杂拖拽（跨容器/动画）上 dnd-kit。
// 🧭 学习模式：🔧固定写法=onDragOver 必 preventDefault + onDrop 交换；本例进一步把顺序持久化到真实 /api/drop
//   （GET 加载 / 首次 POST seed / 拖拽后 PATCH 更新 items 字段），刷新不丢，演示「拖拽 + 后端」。
//   基座特性：任意资源名自动建库（字母开头+字母数字_-），首次 POST 自动建 data/drop.json；GET 缺失库返回 []。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_ITEMS = ['React', 'Vue', 'Svelte', 'Angular']

/**
 * 原生 HTML5 拖拽排序（搬运自 learning-demos 的 DragDropDemo）+ 真实接口持久化
 * 纯 React + DOM，无第三方库；顺序存到 /api/drop（自动建库），刷新不丢。
 */
export default function DragDropPage() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS)
  const [recordId, setRecordId] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const loaded = useRef(false)

  // 👉 加载已存顺序（首次访问则 seed 默认顺序到 /api/drop），刷新不丢
  useEffect(() => {
    if (loaded.current) return // StrictMode 双调用防护
    loaded.current = true
    ;(async () => {
      const res = await fetch('/api/drop')
      const j = await res.json()
      const list = (j.data as { id: number; items?: unknown }[]) ?? []
      if (list.length > 0 && Array.isArray(list[0].items)) {
        setRecordId(list[0].id)
        setItems(list[0].items as string[])
        return
      }
      // 首次：seed 默认顺序（基座自动建 data/drop.json）
      const r = await fetch('/api/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: DEFAULT_ITEMS }),
      })
      const jr = await r.json()
      if (jr.code === 0) {
        const rec = jr.data as { id: number; items: string[] }
        setRecordId(rec.id)
        setItems(rec.items)
      }
    })().catch((e) => console.error('加载顺序失败', e))
  }, [])

  // 👉 onDragStart 记录 dragIndex；onDragOver 必 preventDefault；onDrop 交换并持久化
  function handleDrop(target: number) {
    if (dragIndex === null || dragIndex === target) return
    const from = dragIndex
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(target, 0, moved)
    setItems(next) // 乐观更新 UI
    // 👉 持久化到真实 /api/drop（PATCH 增量修改 items 字段）
    if (recordId !== null) {
      fetch(`/api/drop/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: next }),
      }).catch((e) => console.error('保存顺序失败', e))
    }
    setDragIndex(null)
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>原生拖拽排序（已接真实 /api/drop 持久化）</h1>
      <p style={{ color: '#666' }}>
        拖动条目调整顺序，松手即写入后端，刷新页面顺序不丢。
      </p>
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
            <tr className="border-b"><td className="px-2 py-1">持久化</td><td className="px-2 py-1">手写 axios</td><td className="px-2 py-1">手写 axios</td><td className="px-2 py-1">GET/POST/PATCH /api/drop（本例）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：原生 DnD 三框架写法一致；onDragOver 必须 preventDefault 才能 drop 是关键坑。本例把顺序持久化到真实 /api/drop（GET 加载 / POST 首次 seed / PATCH 更新），刷新不丢，演示「拖拽 + 后端」。</p>
      </details>

    </main>
  )
}

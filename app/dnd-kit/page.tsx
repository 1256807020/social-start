// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（拖拽篇 · dnd-kit）· 用 @dnd-kit/sortable 做可排序列表 + 真实接口持久化（每框架一条 + order 字段）
// · Vue2 对照：用 vuedraggable（底层 SortableJS），<draggable v-model="list" @end="onEnd">，内部也是「拖动→重排数组」；
// · Vue3 对照：同 Vue2，<script setup> 里 ref + vuedraggable，@end 里改顺序；
// · React 对照：@dnd-kit 不操作 DOM，而是用 DndContext + SortableContext + useSortable 声明式描述「谁可拖、谁可放」，
//   拖拽过程由 dnd-kit 用 transform 平滑插值（自带动画），松手 onDragEnd 里用 arrayMove 重排数组（本例）。
// 📌 实战定位：拖拽排序【了解即可·进阶】；原生 DnD 够简单排序用，复杂场景（跨容器/键盘可达性/动画）上 dnd-kit。
// 🧭 学习模式：🔧固定写法 = ① DndContext 包一层 + sensors(Pointer+Keyboard)；② SortableContext 传 items；
//   ③ 子项用 useSortable 拿 transform/transition/listeners 套到元素上；④ onDragEnd 用 arrayMove 重排并持久化。
//   本例进一步把顺序持久化到真实 /api/dnd-kit，并充分利用基座能力：
//   ① GET /api/dnd-kit?sort=order 读取并按 order 排序；② 首次 batch-create 批量建 4 条；
//   ③ 拖拽后 batch-update 批量更新各条 order 字段——每条框架一条记录，刷新不丢，演示「dnd-kit + 后端」。
//   基座特性：任意资源名自动建库（字母开头+字母数字_-），首次 batch-create 自动建 data/dnd-kit.json。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type DndItem = { id: number; label: string; order: number }

// 👉 Omit<DndItem,'id'> = { label; order }：种子数据不含 id，交给后端 genId 自动生成
const DEFAULT_ITEMS: Omit<DndItem, 'id'>[] = [
  { label: 'React', order: 0 },
  { label: 'Vue', order: 1 },
  { label: 'Svelte', order: 2 },
  { label: 'Angular', order: 3 },
]

// 👉 子项组件：用 useSortable(id) 声明「这一行可拖」，dnd-kit 自动算出 transform（位移插值）与 transition（动画）
function SortableRow({ item }: { item: DndItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform), // dnd-kit 把拖拽位移转成 translate3d 字符串，自带平滑跟随
    transition, // 松手后回到新位置的过渡动画（这是原生 DnD 没有的「免费动画」）
    padding: 12,
    margin: 4,
    background: isDragging ? '#cde' : '#eee',
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
    listStyle: 'none',
  }

  return (
    // setNodeRef 绑定可拖节点；{...attributes}{...listeners} 挂上拖拽/键盘事件（含空格选中、方向键移动）
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {item.label}
    </li>
  )
}

/**
 * dnd-kit 排序列表（对应 learning-demos 的拖动排序）+ 真实接口持久化
 * 用 @dnd-kit 声明式实现，自带动画与键盘可达性；每条框架 = /api/dnd-kit 一条记录（含 order 字段），顺序存后端，刷新不丢。
 */
export default function DndKitPage() {
  const [items, setItems] = useState<DndItem[]>([])
  const loaded = useRef(false)

  // 👉 sensors：PointerSensor 负责鼠标/触摸拖拽（distance:5 避免点击误触）；KeyboardSensor 负责键盘可达性
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // 👉 加载已存顺序（利用基座 sort=order 排序查询）；首次访问则 batch-create 批量 seed 默认顺序
  useEffect(() => {
    if (loaded.current) return // StrictMode 双调用防护
    loaded.current = true
    ;(async () => {
      const load = async () =>
        (await (await fetch('/api/dnd-kit?sort=order')).json()) as {
          code: number
          data: DndItem[]
        }
      let j = await load()
      if (j.data.length === 0) {
        // 首次：batch-create 批量建 4 条（基座自动建 data/dnd-kit.json）
        await fetch('/api/dnd-kit/batch-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEFAULT_ITEMS),
        })
        j = await load() // 重新拉取（利用基座 sort=order 排序）
      }
      setItems(j.data)
    })().catch((e) => console.error('加载顺序失败', e))
  }, [])

  // 👉 onDragEnd：active=被拖项，over=落点项；用 arrayMove 按新旧下标重排，并重算 order 持久化
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((it) => it.id === active.id)
    const newIndex = items.findIndex((it) => it.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex).map((it, idx) => ({ ...it, order: idx }))
    setItems(reordered) // 乐观更新 UI
    // 👉 持久化：batch-update 增量合并更新各条 order（只改顺序，记录不删、id 不变，非删除后替换）
    fetch('/api/dnd-kit/batch-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reordered.map((it) => ({ id: it.id, order: it.order }))),
    }).catch((e) => console.error('保存顺序失败', e))
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>dnd-kit 拖拽排序（已接真实 /api/dnd-kit 持久化 · 每框架一条 + order）</h1>
      <p style={{ color: '#666' }}>
        鼠标拖动，或聚焦后按空格选中、方向键移动（键盘可达性）；松手即写入后端（batch-update 批量存 order），刷新顺序不丢。
      </p>
      {/* DndContext 包裹整个拖拽区；collisionDetection=closestCenter 选最近落点 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* SortableContext 接收「可排序项 id 列表」，verticalListSortingStrategy 指定纵向排列策略 */}
        <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
          <ul style={{ padding: 0 }}>
            {items.map((it) => (
              <SortableRow key={it.id} item={it} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 原生 DnD vs dnd-kit & 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">原生 HTML5 DnD</th>
              <th className="px-2 py-1">dnd-kit（本例）</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">触发</td><td className="px-2 py-1">draggable + onDragStart</td><td className="px-2 py-1">useSortable 声明，dnd-kit 接管</td></tr>
            <tr className="border-b"><td className="px-2 py-1">允许放置</td><td className="px-2 py-1">onDragOver 必须 preventDefault</td><td className="px-2 py-1">由 DndContext 自动处理，无需手写</td></tr>
            <tr className="border-b"><td className="px-2 py-1">重排</td><td className="px-2 py-1">手写 splice 删插</td><td className="px-2 py-1">arrayMove(items, from, to)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">动画</td><td className="px-2 py-1">无（瞬移）</td><td className="px-2 py-1">transform + transition 平滑跟随（免费）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">键盘可达性</td><td className="px-2 py-1">需自己实现</td><td className="px-2 py-1">KeyboardSensor + sortableKeyboardCoordinates 开箱</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">
          📝 小结：原生 DnD 理解成本低、零依赖，简单排序够用；dnd-kit 用声明式（DndContext/SortableContext/useSortable）把「拖谁、放哪、怎么动」交给库，
          换来平滑动画 + 键盘可达性 + 跨容器能力，适合复杂拖拽。两者持久化思路完全一致：每条框架 = /api/dnd-kit 一条记录（含 order），
          充分复用基座 GET ?sort=order 读取、首次 batch-create 批量建、拖拽后 batch-update 批量改 order，刷新不丢。
        </p>
      </details>
    </main>
  )
}

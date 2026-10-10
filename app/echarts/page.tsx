// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（图表篇）· 原生 ECharts 接入 React 19
// · Vue2 对照：vue-echarts 封装组件，或 mounted 里 echarts.init(this.$refs.x)；
// · Vue3 对照：onMounted 里 echarts.init(ref.value)，watch(option) 调 setOption，onUnmounted dispose；
// · React 对照：useRef 拿 DOM + useEffect 里 echarts.init，option 变就 setOption，卸载 dispose（本例写法）。
// 📌 实战定位：数据可视化【常规业务常用】，echarts 是国内主流；React 侧推荐直接用原生（避开 echarts-for-react 在 React19 的兼容坑）。
// 🧭 学习模式：🔧固定写法=Chart 容器组件（init/setOption/resize/dispose）；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

// 【ECharts 数据可视化分支 · learn/echarts】
// 演示：用原生 echarts 在 React 19 客户端组件里画图（不依赖 echarts-for-react，避免 React19 兼容问题）。
// 业务：复用 /api/todo 做增删改查骨架；图表展示「已完成 / 未完成」占比（饼图）+ 状态数量（柱状图）。
import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

type Todo = { id: number; title: string; done: boolean }

/** 通用 ECharts 容器：option 变化时 setOption，自动跟随容器尺寸 */
function Chart({ option, height = 320 }: { option: echarts.EChartsOption; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    // 初始化
    const chart = echarts.init(ref.current)
    chartRef.current = chart
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  return <div ref={ref} style={{ width: '100%', height }} />
}

export default function EchartsPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  // 查（分页列表）
  const load = async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${pageSize}&sort=-id`)
    const j = await r.json()
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }

  // 拉全量（给图表用）
  const loadAll = async (): Promise<Todo[]> => {
    const r = await fetch(`/api/todo?page=1&pageSize=1000&sort=-id`)
    const j = await r.json()
    return j.data || []
  }

  useEffect(() => {
    load(1)
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false }),
    })
    setTitle('')
    load(page)
  }

  const toggle = async (t: Todo) => {
    await fetch(`/api/todo/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !t.done }),
    })
    load(page)
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    await fetch(`/api/todo/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editing.title }),
    })
    setEditing(null)
    load(page)
  }

  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    load(page)
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1)

  // 图表 option：每次列表变化重新算（也可单独 loadAll，这里用当前页数据演示更轻量）
  const doneCount = todos.filter((t) => t.done).length
  const undoneCount = todos.length - doneCount

  const pieOption: echarts.EChartsOption = {
    title: { text: '当前页完成状态占比', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { name: '已完成', value: doneCount },
          { name: '未完成', value: undoneCount },
        ],
      },
    ],
  }

  const barOption: echarts.EChartsOption = {
    title: { text: '当前页待办标题字数', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: todos.map((t) => `#${t.id}`) },
    yAxis: { type: 'value', name: '字数' },
    series: [{ type: 'bar', data: todos.map((t) => t.title.length), itemStyle: { color: '#3b82f6' } }],
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">ECharts 数据可视化 · app/echarts</h1>
      <p className="text-sm text-gray-500">
        原生 echarts 接入 React 19（ref + useEffect 初始化，setOption 更新，resize 自适应，卸载 dispose）。
        下方 CRUD 复用 /api/todo，图表随当前页数据更新。
      </p>

      {/* 图表区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border p-3">
          <Chart option={pieOption} />
        </div>
        <div className="rounded border p-3">
          <Chart option={barOption} />
        </div>
      </div>

      {/* CRUD 区 */}
      <form onSubmit={add} className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
          新增
        </button>
        <button className="rounded border px-3 py-1" type="button" onClick={() => load(page)}>
          刷新
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!t.done} onChange={() => toggle(t)} />
            {editing?.id === t.id ? (
              <form onSubmit={saveEdit} className="flex flex-1 gap-2">
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editing?.title ?? ''}
                  onChange={(e) => setEditing({ id: t.id, title: e.target.value })}
                />
                <button className="rounded bg-green-600 px-2 py-1 text-white" type="submit">
                  保存
                </button>
              </form>
            ) : (
              <span
                className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`}
                onDoubleClick={() => setEditing({ id: t.id, title: t.title })}
              >
                #{t.id} {t.title}
              </span>
            )}
            <button className="text-sm text-blue-600" onClick={() => setEditing({ id: t.id, title: t.title })}>
              改
            </button>
            <button className="text-sm text-red-600" onClick={() => remove(t.id)}>
              删
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page <= 1} onClick={() => load(page - 1)}>
          上一页
        </button>
        <span>
          {page} / {totalPages}（共 {total}）
        </span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
        >
          下一页
        </button>
      </div>

      <p className="text-xs text-gray-400">提示：想看全量统计可把 loadAll() 的结果喂给 Chart，这里用当前页演示更轻量。</p>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2 (Options)</th>
              <th className="px-2 py-1">Vue3 (Composition)</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">接入方式</td><td className="px-2 py-1">vue-echarts / mounted init</td><td className="px-2 py-1">onMounted init</td><td className="px-2 py-1">useRef+useEffect init（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">生命周期</td><td className="px-2 py-1">mounted~beforeDestroy</td><td className="px-2 py-1">onMounted~onUnmounted</td><td className="px-2 py-1">useEffect 初始化/卸载 dispose</td></tr>
            <tr className="border-b"><td className="px-2 py-1">数据更新</td><td className="px-2 py-1">watch option</td><td className="px-2 py-1">watch(option)</td><td className="px-2 py-1">setOption(option)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">React19 注意</td><td className="px-2 py-1">—</td><td className="px-2 py-1">—</td><td className="px-2 py-1">避开 echarts-for-react 兼容坑，用原生</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：原生 echarts 用 ref+useEffect 最稳，option 变化 setOption；图表数据来自 /api/todo，随当前页增删改实时刷新。</p>
      </details>

    </main>
  )
}

'use client'

// 【concurrent-transitions · 演示页】 app/concurrent-transitions/page.tsx
// 从 Vue 转 React（并发特性篇）：
//   Vue2/Vue3 靠「异步批处理（nextTick）+ computed 缓存 + 响应式逃逸（shallowRef/Object.freeze）」保证输入不卡，
//   模型是「同步渲染 + 批处理」，没有「可中断渲染」概念。
//   React 的并发特性（Concurrent）独一份：useDeferredValue / useTransition 能把「昂贵的 state 更新」标记为
//   「非紧急」，React 可先响应紧急更新（如输入），把非紧急更新**延后甚至打断**，UI 始终流畅。
// 实战定位：搜索框实时过滤大列表、排序/重算大表格等「输入会触发重渲染卡顿」的场景，用它保流畅。
// 学习模式：🔧 固定写法 = useDeferredValue(value) 拿延迟副本 + 用 deferredValue!==value 判待定；
//          useTransition()→[isPending, startTransition]，把昂贵更新包进 startTransition；
//          👉 练习点 = 把「过滤」换成你自己的昂贵计算（如正则高亮），体会输入不卡。
import React from 'react'

// 生成一份「足够大」的列表，让过滤/排序成为肉眼可见的开销（用于演示并发优化的价值）
const WORDS = ['apple', 'banana', 'cherry', 'delta', 'echo', 'fox', 'gamma', 'hotel']
const BIG_LIST = Array.from({ length: 30000 }, (_, i) => ({
  id: i,
  name: `Item ${i} ${WORDS[i % WORDS.length]}`,
}))

export default function ConcurrentTransitionsPage() {
  // ===== 一、useDeferredValue：搜索防卡顿 =====
  const [query, setQuery] = React.useState('')

  // 🔧 固定写法：useDeferredValue(value) 返回 value 的「延迟副本」
  //    React 会先拿旧值渲染（保持输入流畅），等主线程不忙时再用新值更新。
  const deferredQuery = React.useDeferredValue(query)

  // 🔧 固定写法：用 deferredQuery 做昂贵计算，配合 useMemo 只在 deferredQuery 变时才重算
  //    （用裸 query 就会每次按键都重算 3 万条 → 卡；用 deferredQuery 把重算也推迟）
  const filtered = React.useMemo(
    () => BIG_LIST.filter((it) => it.name.toLowerCase().includes(deferredQuery.toLowerCase())),
    [deferredQuery],
  )

  // 🔧 固定写法：deferredQuery !== query 说明「延迟值还没追上」，此刻正是「降级中」的信号
  const isStale = deferredQuery !== query

  // ===== 二、useTransition：把昂贵更新标记为「非紧急」 =====
  const [sortDesc, setSortDesc] = React.useState(false)
  const [list, setList] = React.useState(BIG_LIST)

  // 🔧 固定写法：useTransition() 返回 [isPending, startTransition]
  //    isPending = 是否还有未完成的非紧急更新（用来显示「加载中」）
  const [isPending, startTransition] = React.useTransition()

  // 🔧 固定写法：把「昂贵的 state 更新」包进 startTransition(fn)，
  //    React 视其为非紧急，可被输入等紧急更新打断，UI 不卡。
  const reshuffle = () => {
    startTransition(() => {
      const next = [...list].sort((a, b) =>
        sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
      )
      setList(next)
      setSortDesc((s) => !s)
    })
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">并发特性：useTransition / useDeferredValue · /concurrent-transitions</h1>
      <p className="text-sm text-gray-500">
        昂贵的重新渲染会卡住输入；用这两个 API 把更新标记为「非紧急」，让 UI 保持流畅。
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">一、useDeferredValue（搜索防卡顿）</h2>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="输入过滤（item / apple…）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-xs text-gray-400">
          {isStale ? '⏳ 延迟值还没追上，列表暂用旧结果渲染…' : `匹配 ${filtered.length} 条`}
        </p>
        {/* 🔧 固定写法：把 isStale 当「降级中」信号，给列表加 opacity 提示（对应 Vue 的 pending 态） */}
        <ul className={`max-h-48 overflow-auto rounded border p-2 text-sm ${isStale ? 'opacity-50' : ''}`}>
          {filtered.slice(0, 100).map((it) => (
            <li key={it.id}>{it.name}</li>
          ))}
          {filtered.length > 100 && <li className="text-gray-400">…仅显示前 100 条</li>}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">二、useTransition（昂贵更新不卡 UI）</h2>
        <button
          className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
          onClick={reshuffle}
          disabled={isPending}
        >
          {isPending ? '排序中…' : '打乱并重排 3 万条'}
        </button>
        <p className="text-xs text-gray-400">
          ⚙️ 通用补充：startTransition 让重渲染「可被打断」；但回调里的同步重算（sort）本身仍占主线程，
          真要彻底不卡需放 Web Worker。本例重点是 React 不再阻塞你的其它操作、并给出 isPending。
        </p>
        <ul className="max-h-32 overflow-auto rounded border p-2 text-sm">
          {list.slice(0, 20).map((it) => (
            <li key={it.id}>{it.name}</li>
          ))}
          <li className="text-gray-400">…仅显示前 20 条（共 {list.length}）</li>
        </ul>
      </section>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（并发 / 防卡顿）</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">React</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">防输入卡顿的核心机制</td><td className="px-2 py-1">useDeferredValue / useTransition：昂贵更新标为「非紧急」，可延后/打断</td><td className="px-2 py-1">异步批处理（nextTick）+ computed 缓存 + v-model.lazy 降频</td><td className="px-2 py-1">同 Vue2 的异步队列；shallowRef/shallowReactive 跳过深层响应式</td></tr>
            <tr className="border-b"><td className="px-2 py-1">「正在更新」待定态</td><td className="px-2 py-1">isPending（useTransition）/ deferredValue!==value（useDeferredValue）</td><td className="px-2 py-1">无内建，自行 nextTick 后判断</td><td className="px-2 py-1">同理，watch flush 控制时机</td></tr>
            <tr className="border-b"><td className="px-2 py-1">可中断渲染</td><td className="px-2 py-1">✅ 并发渲染可被打断（React 独一份能力）</td><td className="px-2 py-1">❌ 同步渲染，靠批处理减少次数</td><td className="px-2 py-1">❌ 同步渲染（响应式调度，无中断概念）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">重计算优化配套</td><td className="px-2 py-1">useMemo 包住昂贵计算，只在 deferred 值变时重算</td><td className="px-2 py-1">computed 天然缓存（依赖不变不重算）</td><td className="px-2 py-1">computed 同左；shallowRef + 手动 triggerRef 控粒度</td></tr>
            <tr className="border-b"><td className="px-2 py-1">大对象性能逃逸</td><td className="px-2 py-1">把更新移出 transition / 用 Web Worker</td><td className="px-2 py-1">Object.freeze 避免响应式劫持</td><td className="px-2 py-1">shallowRef / shallowReactive / markRaw</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React 的并发特性（可中断/延迟渲染）是独一份能力；Vue2/Vue3 靠「异步批处理 + computed 缓存 + 响应式逃逸（shallowRef/Object.freeze/markRaw）」达到类似「输入不卡」效果，但模型不同（无中断渲染）。对初学者最实用的映射：React 用 useDeferredValue/useTransition 显式标记「非紧急更新」；Vue 用 computed 缓存 + nextTick 隐式批处理。两者都会在「计算还在跑」时给一个待定/降级态（React 的 isPending/isStale ↔ Vue 的 nextTick 后状态）。</p>
      </details>
    </main>
  )
}

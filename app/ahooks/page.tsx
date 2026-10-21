'use client'

// 【ahooks · 演示页】 app/ahooks/page.tsx
// 从 Vue 转 React（Hooks 工具库篇 · ahooks）：
//   ahooks 是 React 生态的「组合式工具库」（阿里开源），把常见模式（数据请求、防抖、持久化、生命周期）
//   封装成一行调用的 Hook，等价于 Vue 生态的 VueUse。React 无官方等价物，需第三方库（pnpm add ahooks）；
//   Vue3 则有官方生态 VueUse + Nuxt 自动导入。最该记的是「每个 hook 返回什么形状」，而不是 API 全貌。
// 实战定位：写业务时不想重复造轮子（请求态、防抖、持久化 state），直接上 ahooks / VueUse 这类工具库。
// 学习模式：🔧 固定写法 = useRequest→{data,error,loading,run}；useLocalStorageState→[state,setState]；
//          useBoolean→[state,{toggle,setTrue,setFalse}]；useDebounceFn(fn,{wait})→{run}（调 run 才是防抖后执行）；
//          👉 练习点 = 把 useRequest 的 service 换成你自己的 /api 接口 + 用 useDebounceFn 给搜索做防抖。
import React from 'react'
import { useRequest, useBoolean, useDebounceFn, useLocalStorageState } from 'ahooks'

type Todo = { id: number; title: string; done: boolean }

export default function AhooksPage() {
  const [page, setPage] = React.useState(1)
  const PAGE_SIZE = 8

  // ===== 一、useRequest：数据请求（loading/error/data）+ 手动写操作 =====
  // 🔧 固定写法：useRequest(service, options)
  //   - 自动模式（默认）：返回 { data, error, loading, run, refresh }；service 的解析值进 data
  //   - 手动模式 { manual: true }：需调 run(...) 才触发；{ onSuccess } 是成功回调
  const listReq = useRequest(
    async (p: number) => {
      const r = await fetch(`/api/todo?page=${p}&pageSize=${PAGE_SIZE}&sort=-id`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = await r.json()
      return j as { data: Todo[]; total: number }
    },
    { defaultParams: [1] },
  )
  const todos: Todo[] = listReq.data?.data ?? []
  const total: number = listReq.data?.total ?? 0
  const reload = () => listReq.run(page)

  const addReq = useRequest(
    async (t: string) => {
      await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, done: false }),
      })
    },
    { manual: true, onSuccess: reload },
  )
  const patchReq = useRequest(
    async (id: number, patch: Partial<Todo>) => {
      await fetch(`/api/todo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    },
    { manual: true, onSuccess: reload },
  )
  const delReq = useRequest(
    async (id: number) => {
      await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    },
    { manual: true, onSuccess: reload },
  )

  // ===== 二、useBoolean：布尔切换 =====
  // 🔧 固定写法：useBoolean(default) → [state, { toggle, setTrue, setFalse, set }]
  const [showDone, { toggle: toggleShowDone }] = useBoolean(false)

  // ===== 三、useDebounceFn：防抖（搜索不打爆接口）=====
  // 🔧 固定写法：useDebounceFn(fn, { wait }) → { run, cancel, flush }；调用 run 才是防抖后真正执行
  const [kw, setKw] = React.useState('')
  const { run: runSearch } = useDebounceFn((v: string) => setKw(v), { wait: 300 })
  const visible = showDone ? todos : todos.filter((t) => !t.done)
  const filtered = visible.filter((t) => t.title.toLowerCase().includes(kw.toLowerCase()))

  // ===== 四、useLocalStorageState：持久化 state（SSR 需 mounted 守卫）=====
  // 🔧 固定写法：useLocalStorageState(key, { defaultValue }) → [state, setState]，签名同 useState 但自动读写 localStorage
  const [name, setName] = useLocalStorageState<string>('ahooks-demo-name', { defaultValue: '' })
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  // ⚙️ 通用补充：该 hook 读 localStorage，SSR 下渲染期若直接显示会与服务端 HTML 不一致 → 用 mounted 守卫（呼应 hydration-pitfalls）

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">ahooks 工具库 · /ahooks</h1>
      <p className="text-sm text-gray-500">
        ahooks 是 React 版的「VueUse」：把请求/防抖/持久化/生命周期等常见模式封装成一行 Hook。本页演示 4 个最常用。
      </p>

      {/* 四、持久化 state（mounted 守卫避免水合不一致） */}
      <section className="rounded border p-3">
        <h2 className="mb-1 text-lg font-semibold">四、useLocalStorageState（持久化）</h2>
        {mounted ? (
          <div className="flex items-center gap-2">
            <input
              className="rounded border px-2 py-1"
              placeholder="输入名字（刷新后仍在）"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <span className="text-xs text-gray-400">已持久化：{name || '（空）'}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">客户端加载中…</p>
        )}
      </section>

      {/* 一、useRequest CRUD */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">一、useRequest（请求 + 增删改）</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = (e.currentTarget.elements.namedItem('title') as HTMLInputElement | null)
            if (!input?.value.trim()) return
            addReq.run(input.value)
            input.value = ''
          }}
          className="flex gap-2"
        >
          <input name="title" className="flex-1 rounded border px-2 py-1" placeholder="新待办标题" />
          <button className="rounded bg-blue-600 px-3 py-1 text-white" disabled={addReq.loading} type="submit">
            新增
          </button>
          <button className="rounded border px-3 py-1" type="button" onClick={reload}>
            刷新
          </button>
        </form>

        {listReq.error && <p className="text-sm text-red-600">请求失败：{(listReq.error as Error).message}</p>}
        {listReq.loading && <p className="text-sm text-gray-400">加载中…</p>}

        <ul className="space-y-2">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-2 border-b py-1">
              <input type="checkbox" checked={!!t.done} onChange={() => patchReq.run(t.id, { done: !t.done })} />
              <span className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`}>
                #{t.id} {t.title}
              </span>
              <button
                className="text-sm text-red-600"
                disabled={delReq.loading}
                onClick={() => delReq.run(t.id)}
              >
                删
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between text-sm">
          <button
            className="rounded border px-2 py-1 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => {
              setPage(page - 1)
              listReq.run(page - 1)
            }}
          >
            上一页
          </button>
          <span>
            {page} / {totalPages}（共 {total}）
          </span>
          <button
            className="rounded border px-2 py-1 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => {
              setPage(page + 1)
              listReq.run(page + 1)
            }}
          >
            下一页
          </button>
        </div>
      </section>

      {/* 二、三：useBoolean + useDebounceFn */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">二/三、useBoolean（开关） + useDebounceFn（防抖搜索）</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded border px-3 py-1" onClick={toggleShowDone}>
            {showDone ? '隐藏已完成' : '显示已完成'}
          </button>
          <input
            className="rounded border px-2 py-1"
            placeholder="搜索（防抖 300ms）"
            onChange={(e) => runSearch(e.target.value)}
          />
          <span className="text-xs text-gray-400">防抖后关键字：{kw || '（输入中…）'}</span>
        </div>
      </section>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（ahooks 工具库）</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">React（ahooks）</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">数据请求（loading/error）</td><td className="px-2 py-1">useRequest(service) → {'{ data, error, loading, run }'}</td><td className="px-2 py-1">手动 data/loading/error + axios；vue-request</td><td className="px-2 py-1">VueUse useFetch / Nuxt useAsyncData·useFetch（自动 loading/error）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">防抖 / 节流</td><td className="px-2 py-1">useDebounceFn(fn, {'{ wait }'}) → {'{ run }'}；useThrottleFn</td><td className="px-2 py-1">lodash.debounce 手动</td><td className="px-2 py-1">VueUse useDebounceFn / useThrottleFn</td></tr>
            <tr className="border-b"><td className="px-2 py-1">持久化 state</td><td className="px-2 py-1">useLocalStorageState(key) → [state, setState]</td><td className="px-2 py-1">手动 localStorage + watch</td><td className="px-2 py-1">VueUse useLocalStorage / Nuxt useState</td></tr>
            <tr className="border-b"><td className="px-2 py-1">布尔切换</td><td className="px-2 py-1">useBoolean() → [state, {'{ toggle, setTrue, setFalse }'}]</td><td className="px-2 py-1">手动 data + methods</td><td className="px-2 py-1">VueUse useBoolean / useToggle</td></tr>
            <tr className="border-b"><td className="px-2 py-1">生命周期</td><td className="px-2 py-1">useMount / useUnmount</td><td className="px-2 py-1">mounted / destroyed</td><td className="px-2 py-1">onMounted / onUnmounted</td></tr>
            <tr className="border-b"><td className="px-2 py-1">库定位</td><td className="px-2 py-1">ahooks（第三方组合式工具库，pnpm add ahooks）</td><td className="px-2 py-1">无官方，vue-use 等社区</td><td className="px-2 py-1">VueUse（官方生态）+ Nuxt 自动导入</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：ahooks 是 React 版的「VueUse」——把常见模式（请求、防抖、持久化、生命周期）封装成一行调用的 Hook。固定写法：记住<b>每个 hook 返回什么形状</b>（useRequest→{'{data,error,loading,run}'}；useLocalStorageState→[state,setState]；useBoolean→[state,{'{toggle}'}]），而不是背全 API。React 无内建，需 pnpm add ahooks；Vue3 直接用 VueUse。SSR 下「读浏览器存储/时间的 hook」要先 mounted 再渲染（呼应 hydration-pitfalls）。练习点：把 useRequest 的 service 换成你自己的 /api 接口，并用 useDebounceFn 给搜索做防抖。</p>
      </details>
    </main>
  )
}

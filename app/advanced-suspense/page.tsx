'use client'

import { Suspense, use } from 'react'

/**
 * Suspense 进阶：资源预取（wrapPromise）+ use()（搬运自 learning-demos 的 SuspenseListPreloadDemo）
 * 每个 👉 是给你手敲的练习点。
 *
 * 注：React 19 已移除实验性的 SuspenseList（不再是稳定 API）。
 *     这里演示更通用、仍能运行的「资源预取 + use() 读取」模式。
 */

// 👉 手敲：资源包装器，让组件可用 use(promise) 读取；pending 时抛 Promise 触发 Suspense
function wrapPromise<T>(p: Promise<T>) {
  let status: 'pending' | 'done' = 'pending'
  let result: T
  const suspender = p.then((r) => {
    status = 'done'
    result = r
  })
  return {
    read(): T {
      if (status === 'pending') throw suspender
      return result
    },
  }
}

function fetchUser(id: number) {
  const p = new Promise<{ name: string }>((res) =>
    setTimeout(() => res({ name: `用户${id}` }), id === 1 ? 600 : 1200),
  )
  return wrapPromise(p)
}

function User({ resource }: { resource: ReturnType<typeof fetchUser> }) {
  const user = use(resource.read()) // 👉 React 19 use() 读资源（pending 时自动挂起到外层 Suspense）
  return <p>{user.name}</p>
}

export default function SuspensePage() {
  const r1 = fetchUser(1)
  const r2 = fetchUser(2)
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Suspense 进阶：资源预取</h1>
      <p>
        注：React 19 已移除实验性的 <code>SuspenseList</code>；下面用更通用的
        wrapPromise + use() 模式分别挂起两个资源。
      </p>
      <Suspense fallback={<p>加载用户1…</p>}>
        <User resource={r1} />
      </Suspense>
      <Suspense fallback={<p>加载用户2…</p>}>
        <User resource={r2} />
      </Suspense>
    </main>
  )
}

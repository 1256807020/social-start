'use client'

// 【next-template · layout.tsx（保持状态的外壳）】app/next-template/layout.tsx
// 从 Vue 转 React（路由篇）：
//   layout 相当于 Vue Router 里被 <keep-alive> 缓存的那层外壳组件：
//   导航切换子路由时<strong>不会重新挂载</strong>，组件状态原样保留。
//   （Vue 的对照：<keep-alive><router-view/></keep-alive> 保住父层状态；
//    反过来给 router-view 加 :key="$route.fullPath" 就会强制重建 —— 那就是 template 的行为。）
import Link from 'next/link'
import { useState } from 'react'

export default function TemplateDemoLayout({ children }: { children: React.ReactNode }) {
  // 🔧 关键观察点：这个 count 属于 layout。
  //    在 /next-template/a 与 /next-template/b 之间来回导航，count 不会归零 —— layout 没被重新挂载。
  const [count, setCount] = useState(0)

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">template.tsx vs layout.tsx · /next-template</h1>
        <p className="text-sm text-gray-500">
          两者都包裹页面，差别只有一句：<strong>layout 跨导航保持挂载、状态不丢；template 每次导航都重新挂载</strong>。
        </p>
      </header>

      <div className="rounded border bg-sky-50 p-3 text-sm">
        <p className="mb-2">
          <strong>layout 的状态</strong>（导航后应保留）：
        </p>
        <button
          className="rounded bg-sky-700 px-3 py-1 text-white"
          onClick={() => setCount((c) => c + 1)}
        >
          点我 +1 → {count}
        </button>
      </div>

      <nav className="flex gap-4 text-sm">
        <Link className="underline" href="/next-template">
          首页
        </Link>
        <Link className="underline" href="/next-template/a">
          子页 A
        </Link>
        <Link className="underline" href="/next-template/b">
          子页 B
        </Link>
      </nav>

      {children}
    </div>
  )
}

'use client'

// 【next-use-search-params · 客户端读查询串】app/next-use-search-params/search-reader.tsx
// 从 Vue 转 React（路由篇）：
//   Vue 里是 <strong>$route.query</strong>（响应式对象，模板里直接用）；改查询串用
//   router.push({ query: {...} })。
//   Next 把它拆成两套：<strong>服务端页面用 searchParams 属性，客户端组件用 useSearchParams()</strong>。
//
// ⚠️ 最大的坑：<strong>客户端组件里用 useSearchParams()，必须被 &lt;Suspense&gt; 包住</strong>。
//   否则在静态预渲染时 Next 会报错（或把整页强制退化为动态渲染）—— 本页就是包在 Suspense 里的。
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function SearchReader() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // 改查询串的固定写法：基于当前 params 复制一份 → 改 → 拼回 URL
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      // replace：不堆历史记录（筛选条件变化时很合适）
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams],
  )

  return (
    <div className="space-y-3">
      <div className="rounded bg-gray-50 p-3 text-sm">
        <p className="mb-1 font-semibold">客户端 useSearchParams() 读到的：</p>
        <pre className="overflow-x-auto">
          {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="text-gray-600">关键词 keyword：</label>
        <input
          className="rounded border px-2 py-1"
          defaultValue={searchParams.get('keyword') ?? ''}
          placeholder="输入后失焦"
          onBlur={(e) => setParam('keyword', e.target.value)}
        />
        <button className="rounded border px-2 py-1" onClick={() => setParam('page', '2')}>
          page=2
        </button>
        <button className="rounded border px-2 py-1" onClick={() => setParam('page', '')}>
          清除 page
        </button>
      </div>

      <p className="text-xs text-gray-500">
        改 URL 后地址栏会变、本组件会重新读到新值，但<strong>页面不会整页刷新</strong>。
      </p>
    </div>
  )
}

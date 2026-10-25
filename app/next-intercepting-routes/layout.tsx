// 【next-intercepting-routes · 拦截路由 Intercepting Routes】app/next-intercepting-routes/layout.tsx
// 从 Vue 转 React（路由篇）：
//   Vue Router 没有原生等价物。Vue 里做「列表点开是弹层、刷新又是整页」，
//   通常要自己维护一个 modal state + watch $route，或借助 vue-router 的命名视图硬凑，属于手写状态机。
//   Next.js App Router 用「拦截路由 (.)」原生支持：软导航时把目标路由拦截进插槽渲染成弹层，
//   刷新/直达时才走真实完整页面 —— 一套代码，两种呈现。
// 实战定位：图片/文章/商品列表 → 点开预览（不离开列表，保住滚动位置与筛选条件），
//   分享链接或刷新 → 走完整详情页（利于 SEO 与直达）。这是 App Router 最实用的高级模式。
// 学习模式：🔧 固定写法 = @modal 插槽 + (.)同级拦截 + default.tsx 返回 null；
//          👉 练习点 = 把 (.)photo 改成 (..) 上一级拦截，观察还能不能匹配到。
import type { ReactNode } from 'react'

export default function InterceptLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">拦截路由 Intercepting Routes · /next-intercepting-routes</h1>
        <p className="text-sm text-gray-500">
          点列表 → 弹层预览（列表还在背后）；<strong>刷新或直接访问链接</strong> → 走完整详情页。
        </p>
      </header>

      {/* children = 背景页（列表）；modal = 拦截进来的弹层 */}
      {children}
      {modal}

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">拦截标记对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">标记</th>
              <th className="px-2 py-1">含义</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">(.)</td>
              <td className="px-2 py-1">拦截<strong>同级</strong>路由</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">(..)</td>
              <td className="px-2 py-1">拦截<strong>上一级</strong>路由</td>
            </tr>
            <tr>
              <td className="px-2 py-1">(...)</td>
              <td className="px-2 py-1">从<strong>根目录</strong>拦截</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：拦截路由只作用于<strong>软导航</strong>（点 <code>&lt;Link&gt;</code>）。
          硬刷新/直达时插槽匹配不到 → 渲染 <code>default.tsx</code>（这里返回 null），
          背景 children 则渲染真实的 <code>photo/[id]/page.tsx</code> 整页。
        </p>
      </details>
    </main>
  )
}

// 【next-parallel-routes · 平行路由 Parallel Routes】app/next-parallel-routes/layout.tsx
// 从 Vue 转 React（路由篇）：
//   Vue Router 的「命名视图」：<router-view name="sidebar"/>，routes 里配 components:{ default, sidebar }，
//   作用是「同一个 URL 同屏渲染多个独立视图」。
//   Next.js App Router 的平行路由就是同一件事：用 @slot 文件夹声明「具名插槽」，
//   布局里像接普通 props 一样接住它们，各自摆放、各自取数、各自 loading。
// 实战定位：一个页面由多个「数据域」组成（正文 / 侧栏统计 / 推荐位），
//   平行路由让每个域独立取数 + 独立 loading —— 一个慢查询不再卡住整页（这是它最大的价值）。
// 学习模式：🔧 固定写法 = @slot 文件夹命名 + layout 接同名 props + 每个 slot 配 default.tsx；
//          👉 练习点 = 再加一个 @ads 插槽，并给它单独配 loading.tsx。
import type { ReactNode } from 'react'

// 🔧 固定写法：@stats / @recent 两个文件夹会变成 layout 的两个同名 props（去掉 @ 即名字）。
//    children 是隐式主插槽（对应 page.tsx），另外两个是具名插槽。
export default function ParallelLayout({
  children,
  stats,
  recent,
}: {
  children: ReactNode
  stats: ReactNode
  recent: ReactNode
}) {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">平行路由 Parallel Routes · /next-parallel-routes</h1>
        <p className="text-sm text-gray-500">
          同一 URL 同屏渲染三个插槽：children（主区）+ @stats（统计）+ @recent（最近动态）。
          每个插槽独立取数、独立 loading —— 慢的那个不会拖住快的。
        </p>
      </header>

      {/* 布局决定「插槽摆在哪」：这里是「左主区 + 右侧栏」 */}
      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded border p-4 md:col-span-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            children（主插槽 = page.tsx）
          </h2>
          {children}
        </section>

        <aside className="space-y-4">
          <div className="rounded border p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              @stats（快）
            </h2>
            {stats}
          </div>

          <div className="rounded border p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              @recent（慢，独立 loading）
            </h2>
            {recent}
          </div>
        </aside>
      </div>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue2 / Vue3 / React 三向对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">能力</th>
              <th className="px-2 py-1">Vue Router</th>
              <th className="px-2 py-1">Next.js App Router</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">同屏多视图</td>
              <td className="px-2 py-1">命名视图 router-view name</td>
              <td className="px-2 py-1">平行路由 @slot 插槽</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">未匹配兜底</td>
              <td className="px-2 py-1">路由配置里补组件</td>
              <td className="px-2 py-1">default.tsx</td>
            </tr>
            <tr>
              <td className="px-2 py-1">独立加载态</td>
              <td className="px-2 py-1">自己写 v-if loading</td>
              <td className="px-2 py-1">每插槽一个 loading.tsx</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：平行路由 = 「一个 URL 拆成多个独立渲染单元」。记住三件事：
          ① 文件夹加 <code>@</code> 前缀就是插槽；② layout 里按名字接 props；
          ③ <strong>每个插槽都要写 default.tsx</strong>，否则硬刷新/直达子路由时该插槽没匹配内容会 404。
        </p>
      </details>
    </main>
  )
}

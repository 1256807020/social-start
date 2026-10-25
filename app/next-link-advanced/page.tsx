// 【next-link-advanced · next/link 进阶属性】app/next-link-advanced/page.tsx
// 从 Vue 转 React（路由篇）：
//   Vue Router 的 <router-link> / router.push 也支持对象型跳转（{ name, params, query }），
//   但「预取 prefetch」「跳转后是否回顶部 scroll」这类能力 Vue 没有内置 ——
//   Vue 里要么自己写 scrollBehavior，要么用 router.push 时手动处理。
//   next/link 把这些直接做成了属性：prefetch / scroll / replace，是框架级能力。
// 实战定位：列表页跳详情、保持滚动位置、控制预取开销、登录后「不可回退」。
// 学习模式：🔧 固定写法 = 按需给 Link 加属性；👉 练习点 = 给长列表的每条链接加 prefetch={false} 对比网络请求。
import Link from 'next/link'

export default function LinkAdvancedIndex() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">next/link 进阶属性 · /next-link-advanced</h1>
        <p className="text-sm text-gray-500">
          除了 href，Link 还有 <code>prefetch</code> / <code>scroll</code> / <code>replace</code> 三个常用属性，
          以及「对象型 href」写法。
        </p>
      </header>

      {/* ① 对象型 href：把 pathname 与 query 分开写，适合参数由变量拼出来的场景 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">① 对象型 href</h2>
        <p className="text-sm text-gray-600">
          等价于 <code>/next-link-advanced/target?from=object&page=2</code>，
          但不用自己拼字符串、也不用管 URL 编码。
        </p>
        <Link
          className="inline-block underline"
          href={{ pathname: '/next-link-advanced/target', query: { from: 'object', page: '2' } }}
        >
          → 用对象型 href 跳转
        </Link>
      </section>

      {/* ② prefetch：控制是否在后台预取目标页资源 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">② prefetch（预取）</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            <code>prefetch={'{true}'}</code>：进入视口就预取整页（含数据）—— 点开几乎瞬开，开销最大。
          </li>
          <li>
            <code>prefetch={'{false}'}</code>：<strong>完全不预取</strong> —— 长列表几百条链接时用它省钱。
          </li>
          <li>不写（默认 / <code>auto</code>）：只预取到「loading.tsx 为止」的部分，折中方案。</li>
        </ul>
        <div className="flex gap-3">
          <Link className="underline" href="/next-link-advanced/target?from=prefetch-true" prefetch>
            prefetch=true
          </Link>
          <Link className="underline" href="/next-link-advanced/target?from=prefetch-false" prefetch={false}>
            prefetch=false
          </Link>
        </div>
        <p className="text-xs text-gray-400">打开 Network 面板，把链接滚进视口观察是否有预取请求。</p>
      </section>

      {/* ③ scroll：跳转后是否回到顶部 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">③ scroll（滚动位置）</h2>
        <p className="text-sm text-gray-600">
          默认 <code>scroll={'{true}'}</code>：跳转后回到页面顶部。
          设为 <code>false</code> 则<strong>保持当前滚动位置</strong> ——
          「返回列表还停在原来那条」就靠它。
        </p>
        <div className="flex gap-3">
          <Link className="underline" href="/next-link-advanced/target?from=scroll-true">
            scroll 默认（回顶部）
          </Link>
          <Link className="underline" href="/next-link-advanced/target?from=scroll-false" scroll={false}>
            scroll=false（保持位置）
          </Link>
        </div>
      </section>

      {/* ④ replace：替换历史记录，点「后退」回不到这一页 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">④ replace（替换历史）</h2>
        <p className="text-sm text-gray-600">
          用 <code>replace</code> 跳转后，浏览器历史里<strong>不会多一条记录</strong> ——
          登录成功跳首页、表单提交后跳转，常用它防止用户点后退回到已失效的页面。
        </p>
        <Link className="underline" href="/next-link-advanced/target?from=replace" replace>
          → replace 跳转（之后点后退，回不到本页）
        </Link>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue / React 对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">能力</th>
              <th className="px-2 py-1">Vue Router</th>
              <th className="px-2 py-1">next/link</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">对象型跳转</td>
              <td className="px-2 py-1">router.push({'{name, params, query}'})</td>
              <td className="px-2 py-1">href={'{pathname, query}'}</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">预取</td>
              <td className="px-2 py-1">无内置</td>
              <td className="px-2 py-1">prefetch</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">滚动行为</td>
              <td className="px-2 py-1">scrollBehavior（全局配置）</td>
              <td className="px-2 py-1">scroll（逐链接控制）</td>
            </tr>
            <tr>
              <td className="px-2 py-1">替换历史</td>
              <td className="px-2 py-1">router.replace()</td>
              <td className="px-2 py-1">replace</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：记住三句话 ——
          <strong>要秒开</strong>用 <code>prefetch</code>（但长列表要关掉省钱）；
          <strong>要留住位置</strong>用 <code>scroll={'{false}'}</code>；
          <strong>不让回退</strong>用 <code>replace</code>。
        </p>
      </details>
    </main>
  )
}

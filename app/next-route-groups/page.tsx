// 【next-route-groups · 路由组 Route Groups】app/next-route-groups/page.tsx
// 从 Vue 转 React（路由篇）：
//   Vue Router 的「嵌套路由 + 布局组件」：父路由配一个 component 当外壳，子路由渲染进它的 <router-view>。
//   但 Vue 的嵌套必然体现在 URL 上（/shop/products，父级路径真实存在）。
//   Next.js 的路由组 (group) 多了一层自由：<strong>括号里的名字不进 URL</strong>，
//   纯粹用来「分组共享布局」或「给项目分壳」，URL 保持扁平。
// 实战定位：一个站点拆成几套「壳」——(marketing) 营销壳带 banner、(dashboard) 后台壳带侧边栏、
//   (auth) 登录壳居中卡片；各壳互不干扰，URL 却不会被迫多出 /marketing 这种层级。
// 学习模式：🔧 固定写法 = 文件夹名加括号 (xxx)；👉 练习点 = 新建一个 (auth) 组并给它居中卡片布局。
import Link from 'next/link'

const groups = [
  { href: '/next-route-groups/about', name: '(marketing) 组', desc: '共享「营销外壳」：顶部 banner' },
  { href: '/next-route-groups/settings', name: '(dashboard) 组', desc: '共享「后台外壳」：左侧边栏' },
]

export default function RouteGroupsIndex() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">路由组 Route Groups · /next-route-groups</h1>
        <p className="text-sm text-gray-500">
          文件夹名加括号 <code>(group)</code> 即路由组：<strong>只分组、不进 URL</strong>。
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">点进去看「同 URL 层级、不同外壳」</h2>
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.href} className="rounded border p-3">
              <Link className="font-medium underline" href={g.href}>
                {g.name}
              </Link>
              <p className="text-sm text-gray-500">{g.desc}</p>
              <p className="font-mono text-xs text-gray-400">{g.href}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400">
          注意两个链接的 URL 里<strong>都没有</strong> marketing / dashboard —— 括号被吃掉了。
        </p>
      </section>

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
              <td className="px-2 py-1">共享外壳</td>
              <td className="px-2 py-1">嵌套路由父 component</td>
              <td className="px-2 py-1">路由组 (group) + layout.tsx</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">是否影响 URL</td>
              <td className="px-2 py-1">影响（父路径真实存在）</td>
              <td className="px-2 py-1">不影响（括号不进 URL）</td>
            </tr>
            <tr>
              <td className="px-2 py-1">私有目录</td>
              <td className="px-2 py-1">放 components/ 约定</td>
              <td className="px-2 py-1">_folder 下划线前缀</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：路由组解决「想分壳但不想改 URL」。另外记住
          <code>_components</code> 这类<strong>下划线前缀文件夹是私有目录</strong>，不会生成路由，
          适合放只服务于本模块的组件（见 <code>_components/panel.tsx</code>）。
        </p>
      </details>
    </main>
  )
}

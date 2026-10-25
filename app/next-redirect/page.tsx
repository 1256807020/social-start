// 【next-redirect · redirect / permanentRedirect】app/next-redirect/page.tsx
// 从 Vue 转 React（导航篇）：
//   Vue Router 里是 router.push('/new') / router.replace('/new')，发生在<strong>客户端</strong>；
//   Next 的 redirect() 发生在<strong>服务端</strong>：直接返回 307/308 状态码让浏览器跳，
//   好处是「爬虫与首屏就能看到跳转」，不会先渲染一帧旧页面再跳（SEO 友好）。
// 实战定位：老地址迁新地址、未登录守卫、资源不存在导流。
// 学习模式：🔧 固定写法 = 服务端组件/Server Action/Route Handler 里调用 redirect(url)；
//          永久迁移用 permanentRedirect(url)；👉 练习点 = 在 Server Action 里登录后 redirect 回原页。
import Link from 'next/link'

export default function RedirectIndex() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">redirect 与 permanentRedirect · /next-redirect</h1>
        <p className="text-sm text-gray-500">
          点下面链接，用浏览器开发者工具的 Network 面板看<strong>状态码</strong>。
        </p>
      </header>

      <ul className="space-y-2">
        <li className="rounded border p-3">
          <Link className="font-medium underline" href="/next-redirect/old">
            /old
          </Link>
          <p className="text-sm text-gray-500">
            临时重定向 → <span className="font-mono">307</span>（redirect）。地址改了但以后可能再变。
          </p>
        </li>
        <li className="rounded border p-3">
          <Link className="font-medium underline" href="/next-redirect/legacy">
            /legacy
          </Link>
          <p className="text-sm text-gray-500">
            永久重定向 → <span className="font-mono">308</span>（permanentRedirect）。浏览器和搜索引擎会记住。
          </p>
        </li>
        <li className="rounded border p-3">
          <Link className="font-medium underline" href="/next-redirect/guarded?login=1">
            /guarded?login=1
          </Link>
          <p className="text-sm text-gray-500">
            条件守卫：已登录（login=1）才放行；去掉参数访问 <code>/guarded</code> 会被弹到首页。
          </p>
        </li>
      </ul>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">redirect vs permanentRedirect vs router.push</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">方式</th>
              <th className="px-2 py-1">发生位置</th>
              <th className="px-2 py-1">状态码</th>
              <th className="px-2 py-1">适用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">redirect()</td>
              <td className="px-2 py-1">服务端</td>
              <td className="px-2 py-1">307</td>
              <td className="px-2 py-1">临时跳转、未登录守卫</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">permanentRedirect()</td>
              <td className="px-2 py-1">服务端</td>
              <td className="px-2 py-1">308</td>
              <td className="px-2 py-1">域名/路径永久迁移（SEO）</td>
            </tr>
            <tr>
              <td className="px-2 py-1">router.push()</td>
              <td className="px-2 py-1">客户端</td>
              <td className="px-2 py-1">—</td>
              <td className="px-2 py-1">用户操作后的交互跳转</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          补充：<code>redirect()</code> 在 Server Action / Route Handler 里同样可用（登录成功后跳转很常见）；
          它内部靠<strong>抛异常</strong>实现，所以不要把它写在 try/catch 里（会被自己捕获掉）。
        </p>
      </details>
    </main>
  )
}

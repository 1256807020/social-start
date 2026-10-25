// 【next-font · 字体优化】app/next-font/page.tsx
// 从 Vue 转 React（字体篇）：
//   Vue 侧没有官方等价物 —— @nuxt/fonts 模块做的事和 next/font 类似（自托管 + 兜底度量），
//   但 Vue 纯 SPA 项目基本靠手写 @font-face 或引 CDN。
// 实战定位：任何对「首屏字体」有要求的项目都该用 —— 省一次第三方请求、消除 CLS、字体不依赖外网。
import { inter } from './fonts'

export default function FontPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">next/font 字体优化 · /next-font</h1>
        <p className="text-sm text-gray-500">构建期把字体自托管到自己域名，并消除字号跳变（CLS）。</p>
      </header>

      {/* ① 通过 className 使用：把字体类挂到需要的元素上 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">① 用 className 应用</h2>
        <p className={`${inter.className} text-base`}>
          这一段用的是 Inter 400（Inter: The quick brown fox jumps over the lazy dog. 0123456789）
        </p>
        <p className={`${inter.className} text-xl font-bold`}>
          这一段是 Inter 700 粗体 —— 两个字重都在本地，无需外部请求。
        </p>
      </section>

      {/* ② 用 CSS 变量：方便和 Tailwind 的 font-sans 打通 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">② 用 CSS 变量（推荐）</h2>
        <div className={inter.variable}>
          {/* 这里用内联 style 引用变量；实际项目会在 Tailwind 里配 fontFamily.sans = var(--font-inter) */}
          <p style={{ fontFamily: 'var(--font-inter)' }}>
            这段通过 <code>--font-inter</code> 变量拿到字体。
          </p>
        </div>
        <p className="text-xs text-gray-500">
          <code>variable</code> 的用法更灵活：把它挂到根 layout 上，全站就能统一用{' '}
          <code>font-sans</code> 引用。
        </p>
      </section>

      {/* ③ 怎么验证生效 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">③ 怎么确认它真的自托管了？</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>打开「查看网页源代码」，搜 <code>.woff2</code> —— 会看到形如 <code>/_next/static/media/xxx.woff2</code> 的<strong>本站路径</strong>。</li>
          <li>Network 面板里不会出现 fonts.googleapis.com / fonts.gstatic.com 的请求。</li>
          <li>看 <code>&lt;head&gt;</code> 里有没有 <code>&lt;link rel=&quot;preload&quot; as=&quot;font&quot;&gt;</code> —— 那是 <code>preload</code> 的效果。</li>
        </ol>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">google vs local 怎么选 + 关键选项</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">来源</th>
              <th className="px-2 py-1">要求</th>
              <th className="px-2 py-1">适用</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">next/font/google</td>
              <td className="px-2 py-1">构建机需联网</td>
              <td className="px-2 py-1">想直接用 Google 字体库</td>
            </tr>
            <tr>
              <td className="px-2 py-1">next/font/local</td>
              <td className="px-2 py-1">项目内有字体文件</td>
              <td className="px-2 py-1">内网/离线、需版本锁定、商业字体</td>
            </tr>
          </tbody>
        </table>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            <code>display: &apos;swap&apos;</code>：先用兜底字体渲染再替换，避免文字 invisible 一段时间（FOIT）。
          </li>
          <li>
            <code>preload</code>：默认 true。只给<strong>首屏真正用到</strong>的字重开，别全开浪费带宽。
          </li>
          <li>
            <code>variable</code>：暴露 CSS 变量名，是配合 Tailwind 的最佳实践。
          </li>
          <li>
            <code>adjustFontFallback</code>：默认开启，自动生成度量匹配的兜底字体 ——
            这才是<strong>消除 CLS</strong> 的关键，别关掉。
          </li>
        </ul>
        <p className="mt-3 text-gray-600">
          ⚠️ 本例为何用 local：当前环境访问不到 fonts.googleapis.com（构建会失败），
          所以改用 npm 上的开源字体 <code>@fontsource/inter</code>，把 woff2 拷进项目再用 local 加载。
          实际项目能连 Google 时，用 <code>next/font/google</code> 更省事。
        </p>
      </details>
    </main>
  )
}

// 【next-seo-files · sitemap.ts / robots.ts 约定文件】app/next-seo-files/page.tsx
// 🔧 固定写法：这两个文件<strong>必须放在 app/ 根目录</strong>（和 layout.tsx 同级），
//    Next 会自动把它们暴露成 /sitemap.xml 与 /robots.txt —— 不需要自己写 route handler。
// 从 Vue 转 React（SEO 篇）：
//   Nuxt 靠 @nuxtjs/sitemap 之类的模块；Vue SPA 一般是手写 public/sitemap.xml + robots.txt。
//   手写的问题：内容变了要同步改，文章多了没法维护。
//   Next 的做法是「用代码生成」—— 能读数据库、能按环境返回不同结果。
export default function SeoFilesPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">sitemap.ts / robots.ts · /next-seo-files</h1>
        <p className="text-sm text-gray-500">
          两个「文件即路由」的 SEO 约定：放对位置就自动生成，不用手写 XML。
        </p>
      </header>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">直接访问看结果</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <a className="underline" href="/sitemap.xml" target="_blank" rel="noreferrer">
              /sitemap.xml
            </a>
            <span className="text-gray-500"> ← 由 app/sitemap.ts 生成</span>
          </li>
          <li>
            <a className="underline" href="/robots.txt" target="_blank" rel="noreferrer">
              /robots.txt
            </a>
            <span className="text-gray-500"> ← 由 app/robots.ts 生成</span>
          </li>
        </ul>
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">为什么用代码生成？</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>新发一篇文章，sitemap 自动就多一条 —— 不用手工改 XML。</li>
          <li>可以<strong>按环境区分</strong>：预发环境 robots 全站 disallow，生产环境才允许抓取。</li>
          <li>
            站点很大（几万条）时可用 <code>generateSitemaps</code> 拆成{' '}
            <code>/sitemap/0.xml</code>、<code>/sitemap/1.xml</code> 分片，避免单文件过大。
          </li>
        </ul>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">同类 SEO 约定文件一览</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">文件（都在 app/ 根）</th>
              <th className="px-2 py-1">生成</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">sitemap.ts</td>
              <td className="px-2 py-1">/sitemap.xml</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">robots.ts</td>
              <td className="px-2 py-1">/robots.txt</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">manifest.ts</td>
              <td className="px-2 py-1">/manifest.webmanifest（PWA）</td>
            </tr>
            <tr>
              <td className="px-2 py-1">icon.svg / apple-icon.png / opengraph-image</td>
              <td className="px-2 py-1">站点图标与社交分享图</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          这些都属于「文件型元数据约定」：放对文件名和位置，Next 自动接管，
          配合前面学的 <code>metadata</code> / <code>generateMetadata</code> 就构成了完整的 SEO 方案。
        </p>
      </details>
    </main>
  )
}

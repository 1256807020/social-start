// 【next-metadata · 静态 metadata（继承模板）】app/next-metadata/page.tsx
import type { Metadata } from 'next'

// 🔧 固定写法（title 三形态之二）：子页面给一个字符串 title，
//    会被父 layout 的 template 套上 → 最终标签页显示「首页 | 我的站点」。
export const metadata: Metadata = {
  title: '首页',
  description: '静态 metadata：直接 export 一个对象，构建期就确定。',
}

export default function MetadataHome() {
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">① 静态 metadata</h2>
      <p className="text-sm text-gray-700">
        本页 title 是字符串 <code>首页</code>，被父 layout 的{' '}
        <code>template: %s | 我的站点</code> 套成「首页 | 我的站点」。
      </p>
      <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">
        看浏览器标签页确认。也可用「查看网页源代码」搜 <code>&lt;title&gt;</code> —— 它在
        SSR 的 HTML 里，爬虫能直接读到（这正是 SEO 需要的）。
      </p>
    </section>
  )
}

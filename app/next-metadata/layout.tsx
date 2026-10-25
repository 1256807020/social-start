// 【next-metadata · Metadata API（SEO 元数据）】app/next-metadata/layout.tsx
// 从 Vue 转 React（SEO 篇）：
//   Vue2 用 vue-meta；Vue3/Nuxt3 用 @unhead/vue 的 useHead() / useSeoMeta()，或 nuxt.config 的 app.head。
//   关键差异：Vue 的 head 管理是「运行时」注入（客户端组件里也能改 document.title）；
//   而 Next 的 metadata 是<strong>框架在渲染期生成并写进 &lt;head&gt;</strong>，
//   👉 因此 <strong>只有服务端组件（layout.tsx / page.tsx）能导出 metadata</strong>，
//      标了 'use client' 的文件导出 metadata 会报错 —— 这是 Vue 转过来最容易踩的一点。
// 实战定位：SEO 三件套就靠它 —— title / description / openGraph（社交分享卡片）。
// 学习模式：🔧 固定写法 = export const metadata（静态）或 export async function generateMetadata（动态）；
//          👉 练习点 = 给 post/[id] 再补 openGraph.images，观察分享卡片变化。
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

// 🔧 固定写法（title 三形态之一）：default = 没设 title 时的兜底；template = 子页面 title 的拼接模板。
//    %s 会被子页面的 title 替换：子页面 title='首页' → 最终「首页 | 我的站点」。
export const metadata: Metadata = {
  title: {
    default: '我的站点',
    template: '%s | 我的站点',
  },
  description: '演示 Next.js 的 Metadata API：静态 metadata 与动态 generateMetadata。',
}

export default function MetadataLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Metadata API · /next-metadata</h1>
        <p className="text-sm text-gray-500">
          看浏览器标签页标题的变化：这三个页面的 title 来自三种不同写法。
        </p>
      </header>
      <nav className="flex gap-4 text-sm">
        <Link className="underline" href="/next-metadata">首页（继承模板）</Link>
        <Link className="underline" href="/next-metadata/about">关于（absolute 脱离模板）</Link>
        <Link className="underline" href="/next-metadata/post/1">文章 1（动态生成）</Link>
      </nav>
      {children}
    </main>
  )
}

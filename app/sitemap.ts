// 【next-seo-files · sitemap.ts】app/sitemap.ts
// 🔧 固定写法：放在 app/ 根目录，Next 会自动把它暴露成 <strong>/sitemap.xml</strong>。
//    返回类型是 Next 提供的 MetadataRoute.Sitemap。
// 从 Vue 转 React（SEO 篇）：
//   Nuxt 用 @nuxtjs/sitemap / nuxt-simple-sitemap 模块；纯 Vue SPA 通常手写一份 public/sitemap.xml。
//   差别在于：Next 的 sitemap.ts 是<strong>代码</strong>，可以动态读数据库生成 ——
//   文章站有 869 篇也不用手工维护 XML。
import type { MetadataRoute } from 'next'

const BASE = 'https://example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // 静态页面
  const staticPages = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  // 🔧 实战写法：动态内容从数据源读（本例用常量模拟，真实项目换成 await 查库 / 调 /api）
  const posts = [
    { slug: 'hello', updatedAt: '2026-10-01' },
    { slug: 'world', updatedAt: '2026-10-20' },
  ].map((p) => ({
    url: `${BASE}/posts/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...posts]
}

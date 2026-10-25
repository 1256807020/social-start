// 【next-seo-files · robots.ts】app/robots.ts
// 🔧 固定写法：放在 app/ 根目录，Next 会自动暴露成 <strong>/robots.txt</strong>。
// 作用：告诉爬虫哪些能抓、哪些不能抓，以及 sitemap 在哪。
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*', // 对所有爬虫
        allow: '/',
        disallow: ['/api/', '/admin/'], // 接口与后台不让抓
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
    host: 'https://example.com',
  }
}

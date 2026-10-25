// 【next-mdx · 启用 MDX】next.config.mjs
// 本分支为演示 MDX 内容管线，需要在基座配置上挂 @next/mdx（仅此分支，不影响 basic）。
// 三步开箱：① createMDX 包住配置；② pageExtensions 加上 md/mdx；③ 根目录放 mdx-components.tsx。
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 🔧 固定写法：让 Next 把 .md / .mdx 也认作「页面文件」
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({})

export default withMDX(nextConfig)

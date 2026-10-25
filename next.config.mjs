// 【next-image · images 进阶配置】next.config.mjs（仅本学习分支修改，不回 basic）
// ⚠️ 前提：基座默认写了 images.unoptimized = true（关掉优化、直接原图输出）。
//    要演示「真正的图片优化配置」，必须把 unoptimized 去掉 —— 否则下面这些配置全都不会生效。
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // ① remotePatterns：远程图片域名白名单。
    //    没登记就用 next/image 加载外链图，会直接报错（这是最常见的踩坑）。
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],

    // ② formats：输出什么现代格式。AVIF 比 WebP 更小但编码更慢，通常两个都要。
    formats: ['image/avif', 'image/webp'],

    // ③ deviceSizes：生成哪些「整屏宽度」档位（配合 sizes 做响应式）
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // ④ imageSizes：生成哪些「小图」档位（头像、缩略图用）
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig

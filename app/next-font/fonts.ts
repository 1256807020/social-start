// 【next-font · 本地字体定义】app/next-font/fonts.ts
// 从 Vue 转 React（字体篇）：
//   Vue 项目通常直接在 CSS 里 @font-face 引 CDN 字体，或在 index.html 塞 <link> 到 Google Fonts。
//   三个老问题：① 多一次第三方 DNS/连接（拖慢首屏）；② 字体到位前后字号跳变（CLS）；
//   ③ 用户访问时可能正在请求 Google，隐私与可用性都不受控。
//   next/font 一次性解决：构建期把字体<strong>下载并自托管</strong>到自己域名下，
//   同时自动生成 size-adjust 的兜底字体，消除布局跳动。
//
// 两种来源：
//   next/font/google —— 构建期从 Google Fonts 拉取（<strong>需要构建机联网</strong>）
//   next/font/local  —— 用项目里的字体文件（离线可用、版本可控）← 本例用它
import localFont from 'next/font/local'

// 🔧 固定写法：src 是一个数组，每个字重/样式一个文件；
//   variable 暴露一个 CSS 变量名（方便配合 Tailwind）；display:'swap' 先用兜底字体顶上再替换。
export const inter = localFont({
  src: [
    { path: './fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: true, // 默认 true：把字体加进 <link rel="preload">，尽快下载
})

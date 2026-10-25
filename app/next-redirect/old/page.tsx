// 【next-redirect · 临时重定向 307】app/next-redirect/old/page.tsx
// 🔧 固定写法：服务端组件里直接调 redirect(url)，Next 会返回 307 让浏览器跳转。
//    访问 /next-redirect/old 会被送到 /next-redirect/new。
import { redirect } from 'next/navigation'

export default function OldPage() {
  redirect('/next-redirect/new')
  // redirect 内部靠抛异常实现，所以下面这行永远不会执行（写了也无妨，通常省略）
}

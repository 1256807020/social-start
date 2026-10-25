// 【next-route-handlers · 处理器内重定向】app/next-route-handlers/api/old/route.ts
// 🔧 固定写法：Route Handler 里可以用 redirect() 做「接口版本迁移」
//   （老地址 /api/old → 新地址 /api），客户端会自动跟随。
//   若想让客户端拿到 308 自己做决定，可用 NextResponse.redirect(url, 308)。
import { redirect } from 'next/navigation'

export async function GET() {
  // 老接口废弃，统一导流到新接口
  redirect('/next-route-handlers/api')
}

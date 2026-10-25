// 【next-route-handlers · Route Handler 上的 ISR】app/next-route-handlers/api/time/route.ts
// 🔧 固定写法：Route Handler 也能用「路由段配置」控制缓存，和页面一样。
//   dynamic = 'force-static'：强制静态化（构建期生成一次）
//   revalidate = 5          ：每 5 秒后台重新生成（ISR）
// ⚠️ 前提：只有 GET 能被静态化；一旦用了 cookies()/headers()/request 就会退化为动态。
export const dynamic = 'force-static'
export const revalidate = 5

// 演示：连 NextResponse 都不用，直接返回原生 Web Response 也完全可以
export async function GET() {
  return Response.json({
    time: new Date().toLocaleTimeString('zh-CN'),
    note: '这个时间每 5 秒才变一次（ISR），不是每次请求都刷新',
  })
}

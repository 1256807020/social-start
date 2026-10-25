// 【next-after · Route Handler 里的 after()】app/next-after/api/route.ts
// 🔧 固定写法：Route Handler 里同样可以用 after()，把「收尾任务」挪到响应之后。
//    典型场景：接口返回后记录一条访问日志 / 上报耗时，而不让用户多等。
import { after } from 'next/server'

export async function GET() {
  const start = Date.now()

  // 注册响应后的收尾任务
  after(() => {
    console.log(`[after][api] GET /next-after/api 已响应，耗时 ${Date.now() - start}ms`)
  })

  return Response.json({ ok: true, msg: '响应会立刻返回，日志稍后才在终端打印' })
}

// 【next-connection · 动态部分（被 connection() 标记为"等请求"）】app/next-connection/dynamic-part.tsx
// 🔧 固定写法：在这个组件里先 await connection()，
//    意思是「从这里开始的内容依赖真实请求，不要在构建期预渲染」。
//    于是外层 <Suspense> 可以先出静态骨架，这一块后补 —— 这就是流式渲染的关键开关。
import { connection } from 'next/server'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default async function DynamicPart() {
  // await connection()：声明「以下属于请求期内容」，Next 就不会把它算进预渲染
  await connection()

  // 之后就可以安全使用「只有请求期才有意义」的东西：
  // 时间、随机值、headers()、cookies()、实时库存等
  await sleep(2000)

  return (
    <div className="rounded border bg-amber-50 p-3 text-sm">
      <p className="font-semibold">动态部分（2 秒后流式补上）</p>
      <p className="text-gray-700">
        本次请求时间：<span className="font-mono">{new Date().toLocaleTimeString('zh-CN')}</span>
      </p>
      <p className="text-xs text-gray-500">
        每次刷新都会变 —— 证明它是「请求时才算」，没有被预渲染固化。
      </p>
    </div>
  )
}

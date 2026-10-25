// 【next-convention-files · 慢页面（触发 loading.tsx）】app/next-convention-files/slow/page.tsx
// 故意 await 3 秒：期间浏览器先看到同级 loading.tsx 的骨架屏，
// 数据好了再流式替换 —— 这就是「流式渲染 streaming」最直观的样子。
import Link from 'next/link'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default async function SlowPage() {
  await sleep(3000)
  return (
    <section className="space-y-2 rounded border p-4">
      <h2 className="text-lg font-semibold">慢页面加载完成 · /next-convention-files/slow</h2>
      <p className="text-sm text-gray-600">
        你刚才看到的骨架屏就是 <code>loading.tsx</code>；3 秒后真实内容流式替换上去。
      </p>
      <Link className="inline-block underline" href="/next-convention-files">
        ← 返回
      </Link>
    </section>
  )
}

// 【next-convention-files · 抛错页面（触发 error.tsx）】app/next-convention-files/boom/page.tsx
// 默认正常显示；带 ?fail=1 时故意抛错，交给同级 error.tsx 兜住（不会整站白屏）。
import Link from 'next/link'

export default async function BoomPage({
  searchParams,
}: {
  searchParams: Promise<{ fail?: string }>
}) {
  const sp = await searchParams

  if (sp.fail === '1') {
    // 🔧 演示：服务端组件里抛错 → 被「最近的」error.tsx 捕获
    throw new Error('boom！这是故意抛出的错误，用来演示 error.tsx')
  }

  return (
    <section className="space-y-2 rounded border p-4">
      <h2 className="text-lg font-semibold">还没出错 · /next-convention-files/boom</h2>
      <p className="text-sm text-gray-600">点下面的链接让它抛错：</p>
      <Link className="inline-block underline" href="/next-convention-files/boom?fail=1">
        触发错误 ?fail=1
      </Link>
    </section>
  )
}

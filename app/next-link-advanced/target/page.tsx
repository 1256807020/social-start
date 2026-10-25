// 【next-link-advanced · 跳转目标页】app/next-link-advanced/target/page.tsx
// 故意做得很长：这样才能观察到 scroll={false}（保持滚动位置）与默认（回到顶部）的差别。
import Link from 'next/link'

export default async function TargetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">目标页 · /next-link-advanced/target</h1>

      <div className="rounded border bg-gray-50 p-3 text-sm">
        <p className="mb-1 font-semibold">收到的查询参数：</p>
        <pre className="overflow-x-auto">{JSON.stringify(sp, null, 2)}</pre>
        <p className="mt-2 text-xs text-gray-500">
          <code>from</code> 告诉你刚才点的是哪种 Link（对象 href / prefetch / scroll / replace）。
        </p>
      </div>

      <div className="flex gap-3 text-sm">
        <Link className="underline" href="/next-link-advanced">
          ← 返回（默认回顶部）
        </Link>
        <Link className="underline" href="/next-link-advanced" scroll={false}>
          ← 返回并保持滚动位置
        </Link>
      </div>

      {/* 撑高页面，方便验证滚动行为 */}
      <div className="space-y-2">
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i} className="rounded border p-2 text-sm text-gray-600">
            第 {i + 1} 行占位内容（把页面撑高，用来观察 scroll 行为）
          </p>
        ))}
      </div>
    </main>
  )
}

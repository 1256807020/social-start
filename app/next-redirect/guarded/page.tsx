// 【next-redirect · 条件守卫（未登录弹回）】app/next-redirect/guarded/page.tsx
// 🔧 固定写法：redirect() 可以放在任意条件分支里 —— 这是做「登录守卫」最直接的写法。
//    访问 /next-redirect/guarded 会被弹回首页；带 ?login=1 才放行。
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GuardedPage({
  searchParams,
}: {
  searchParams: Promise<{ login?: string }>
}) {
  const sp = await searchParams
  const isLogin = sp.login === '1'

  // 未登录 → 弹回首页（真实项目里这里会读 session / cookie）
  if (!isLogin) {
    redirect('/next-redirect')
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">受保护页面 · /next-redirect/guarded</h1>
      <p className="text-sm text-gray-600">
        你带了 <code>?login=1</code>，所以通过了守卫。去掉参数再访问就会被 redirect 弹走。
      </p>
      <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">
        ⚠️ 注意：<code>redirect()</code> 靠抛异常实现，<strong>不要</strong>写在 try/catch 内部，否则会被自己捕获、跳转失效。
      </p>
      <Link className="inline-block underline" href="/next-redirect">
        ← 返回
      </Link>
    </main>
  )
}

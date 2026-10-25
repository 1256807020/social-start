// 【next-metadata · generateMetadata（按数据动态生成）】app/next-metadata/post/[id]/page.tsx
// 从 Vue 转 React（SEO 篇）：
//   Nuxt3 的对位是 useSeoMeta() / useHead()（在 setup 里按数据动态设置），
//   Next 的对位是导出 async 函数 generateMetadata —— 思路一样「按数据算」，但发生在服务端渲染期。
import type { Metadata } from 'next'
import Link from 'next/link'

const posts: Record<string, { title: string; desc: string }> = {
  '1': { title: '第一篇文章', desc: '讲 generateMetadata 的基本用法。' },
  '2': { title: '第二篇文章', desc: '讲 openGraph 社交分享卡片。' },
}

// 🔧 固定写法：generateMetadata 与页面组件「同参数」（都能拿到 params / searchParams），
//    且 params 在 Next 15+ 是 Promise，同样要 await。
//    它可以单独 await 取数 —— 与页面组件的数据请求并行执行，不会串行拖慢。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = posts[id]

  return {
    title: post?.title ?? '文章不存在',
    description: post?.desc,
    // openGraph：社交平台分享时的卡片信息（微信/QQ/推特等抓取的就是这个）
    openGraph: {
      title: post?.title ?? '文章不存在',
      description: post?.desc,
      type: 'article',
    },
    // robots：告诉搜索引擎本页要不要收录
    robots: { index: Boolean(post), follow: Boolean(post) },
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = posts[id]

  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">{post?.title ?? '文章不存在'}</h2>
      <p className="text-sm text-gray-700">{post?.desc ?? '换 /post/2 看看另一篇。'}</p>
      <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">
        本页 title/description/openGraph 全部由 <code>generateMetadata</code> 按 id 动态算出 ——
        文章站、商品详情页就是这么做的。
      </p>
      <Link className="inline-block underline" href="/next-metadata">
        ← 返回
      </Link>
    </section>
  )
}

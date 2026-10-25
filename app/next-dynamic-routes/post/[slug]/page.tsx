// 【next-dynamic-routes · [slug] 单段动态路由】app/next-dynamic-routes/post/[slug]/page.tsx
// 文件夹名 [slug] → URL /next-dynamic-routes/post/hello 时 params.slug = 'hello'。
import Link from 'next/link'

const posts: Record<string, { title: string; body: string }> = {
  hello: { title: '第一篇文章', body: '方括号文件夹 = 动态段，params.slug 拿到真实值。' },
  world: { title: '第二篇文章', body: 'generateStaticParams 里列出的 slug 会在构建期预渲染。' },
}

// 🔧 固定写法：generateStaticParams 告诉 Next「构建时先把这些参数渲染成静态页」。
//    好处：这些页面直接命中静态文件/CDN，TTFB 极低（对 SEO 与首屏很有用）。
//    没列到的 slug 依然能访问，只是改成按需生成。
export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}

// Next 15+：params 是 Promise，必须 await（这是最容易忘的一条）。
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]

  return (
    <main className="mx-auto max-w-3xl space-y-3 p-6">
      <h1 className="text-2xl font-bold">{post?.title ?? '文章不存在'}</h1>
      <p className="font-mono text-sm text-gray-500">slug = {slug}</p>
      <p className="text-gray-700">
        {post?.body ?? '这个 slug 没在 generateStaticParams 里，会按需生成。'}
      </p>
      <Link className="inline-block underline" href="/next-dynamic-routes">
        ← 返回
      </Link>
    </main>
  )
}

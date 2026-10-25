// 【next-metadata · absolute 标题（脱离父模板）】app/next-metadata/about/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

// 🔧 固定写法（title 三形态之三）：absolute 表示「不要用父级 template 拼接」，
//    最终标签页就是「关于我们（绝对标题）」，不会带「| 我的站点」后缀。
export const metadata: Metadata = {
  title: { absolute: '关于我们（绝对标题）' },
}

export default function AboutPage() {
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">② absolute 标题</h2>
      <p className="text-sm text-gray-700">
        父级有 <code>template</code> 时，子页面默认会被拼接；想「整条 title 自己说了算」就用{' '}
        <code>{'{ absolute: "..." }'}</code>。
      </p>
      <p className="text-xs text-gray-500">
        三种形态回顾：<code>default</code>（没设 title 时的兜底）、<code>template</code>（拼接模板）、
        <code>absolute</code>（跳过模板）。
      </p>
      <Link className="inline-block underline" href="/next-metadata">
        ← 返回
      </Link>
    </section>
  )
}

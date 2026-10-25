// 【next-intercepting-routes · (..) 上一级拦截的入口】app/next-intercepting-routes/albums/page.tsx
// 目录关系（记牢这句，拦截标记全靠它推算）：
//   app/next-intercepting-routes/
//   ├─ albums/                 ← 你正在这一层（相当于官方示例里的 feed）
//   │  └─ (..)gallery/         ← 拦截器：(..) = 往上退一级，再找 gallery
//   └─ gallery/page.tsx        ← 真实目标页（与 albums 同级）
// 所以：从 /albums 点链接去 /gallery 时，命中的是 albums/(..)gallery，而不是真实页。
import Link from 'next/link'

export default function AlbumsPage() {
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">相册列表 · /next-intercepting-routes/albums</h2>
      <p className="text-sm text-gray-600">
        这一页用来演示 <strong>(..) 上一级拦截</strong>：目标 <code>gallery</code> 与本页{' '}
        <code>albums</code> 是<strong>同级</strong>的，所以拦截器要写在 albums 里面、并用{' '}
        <code>(..)</code> 往上退一级去匹配它。
      </p>
      <Link className="inline-block underline" href="/next-intercepting-routes/gallery">
        → 去看看 gallery（会被 (..) 拦截）
      </Link>
      <p className="text-xs text-gray-400">
        注意：拦截只在<strong>软导航</strong>（点这个 Link）时生效；
        直接刷新或粘贴 /gallery 的地址，会走真实完整页。
      </p>
      <Link className="inline-block text-xs underline" href="/next-intercepting-routes">
        ← 返回
      </Link>
    </section>
  )
}

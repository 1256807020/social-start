// 【next-draft-mode · 草稿/预览模式】app/next-draft-mode/page.tsx
// 从 Vue 转 React（预览篇）：
//   Nuxt3 有官方 composable <strong>usePreviewMode()</strong>（enable/disable/state），
//   正是 Next 的 draftMode() 的对位 —— 两者思路一致：用一个 cookie 标记「这是预览会话」，
//   服务端据此决定要不要渲染未发布内容。
// 实战定位：接 CMS（WordPress / Strapi / Contentful / Sanity）时的「预览未发布文章」。
//   编辑后台点预览 → 跳到站点并带上草稿标记 → 站点渲染草稿内容，普通访客看不到。
// 学习模式：🔧 固定写法 = 服务端读 await draftMode()；开关放在 Route Handler 里；
//          👉 练习点 = 用无痕窗口访问同一 URL，确认看不到草稿内容。
import { draftMode } from 'next/headers'

// 模拟「已发布」与「草稿」两份数据
const published = [{ id: '1', title: '已发布的文章' }]
const drafts = [
  { id: '1', title: '已发布的文章' },
  { id: '2', title: '【草稿】还没发布的新文章' },
  { id: '3', title: '【草稿】改了一半的旧文章' },
]

export default async function DraftModePage() {
  // 🔧 固定写法：draftMode() 是异步的（Next 15+），要 await
  const { isEnabled } = await draftMode()

  // 预览模式下才把草稿也列出来
  const list = isEnabled ? drafts : published

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">draftMode 草稿模式 · /next-draft-mode</h1>
        <p className="text-sm text-gray-500">用 cookie 标记预览会话，服务端据此渲染未发布内容。</p>
      </header>

      <section
        className={`rounded border p-4 ${isEnabled ? 'bg-green-50' : 'bg-gray-50'}`}
      >
        <p className="text-sm">
          当前状态：
          <strong className={isEnabled ? 'text-green-700' : 'text-gray-700'}>
            {isEnabled ? '预览模式已开启（能看到草稿）' : '普通访问（只看已发布）'}
          </strong>
        </p>
        <div className="mt-3 flex gap-2 text-sm">
          <a className="rounded bg-green-600 px-3 py-1 text-white" href="/next-draft-mode/api/enable">
            开启预览
          </a>
          <a className="rounded border px-3 py-1" href="/next-draft-mode/api/disable">
            关闭预览
          </a>
        </div>
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">文章列表</h2>
        <ul className="space-y-1 text-sm">
          {list.map((a) => (
            <li key={a.id} className="border-b pb-1 last:border-0">
              {a.title}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500">
          {isEnabled
            ? '现在能看到 3 条（含 2 条草稿）。'
            : '现在只有 1 条 —— 草稿对普通访客不可见。'}
        </p>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">原理与注意事项</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            <strong>怎么标记的</strong>：开启后 Next 会写一个名为{' '}
            <code>__prerender_bypass</code> 的 cookie；服务端据此判断。
          </li>
          <li>
            <strong>只能在服务端用</strong>：<code>draftMode()</code> 来自{' '}
            <code>next/headers</code>，客户端组件里读不到。
          </li>
          <li>
            <strong>开关要放在 Route Handler / Server Action 里</strong>
            （写 cookie 属于写操作，渲染期不能写 —— 和 cookies() 的规则一样）。
          </li>
          <li>
            <strong>它会绕过静态缓存</strong>：开启预览后该请求走动态渲染，
            所以能拿到最新草稿，但也意味着预览时没有 CDN 缓存。
          </li>
          <li>
            <strong>别忘了鉴权</strong>：真实项目里 enable 接口必须校验「这个人有权预览」，
            否则谁都能看到未发布内容。
          </li>
        </ul>
      </details>
    </main>
  )
}

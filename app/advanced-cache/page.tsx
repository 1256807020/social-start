/**
 * 高阶：Next 缓存策略（搬运自进阶大纲 advanced-cache）
 *  Next 默认会对 fetch 结果与路由做缓存，理解以下四种策略是高阶必点。
 * 每个 👉 是给你手敲的练习点（本页为服务端组件，可直接 await fetch）。
 */
export default async function CachePage() {
  // 👉 1. 默认缓存（静态/不变的第三方数据）：Next 会按 URL 缓存
  // const r1 = await fetch('https://api.example.com/static')

  // 👉 2. 定时重新验证（数据会变化，但允许短暂陈旧）：
  // const r2 = await fetch('https://api.example.com/posts', { next: { revalidate: 60 } })

  // 👉 3. 完全不缓存（每次请求都打后端，如用户私有数据）：
  // const r3 = await fetch('https://api.example.com/me', { cache: 'no-store' })

  // 👉 4. 用 unstable_cache 包裹任意异步函数，并按 tag 失效：
  // import { unstable_cache } from 'next/cache'
  // const getPosts = unstable_cache(async () => {...}, ['posts'], { tags: ['posts'] })
  // 失效：import { revalidateTag } from 'next/cache'; revalidateTag('posts')

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Next 缓存策略</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 6 }}>场景</th>
            <th style={{ border: '1px solid #ccc', padding: 6 }}>写法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>静态数据</td>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>
              <code>fetch(url)</code>（默认缓存）
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>定时刷新</td>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>
              <code>{'{ next: { revalidate: 60 } }'}</code>
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>动态/私有</td>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>
              <code>{"{ cache: 'no-store' }"}</code>
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>函数级缓存</td>
            <td style={{ border: '1px solid #ccc', padding: 6 }}>
              <code>unstable_cache</code> + <code>revalidateTag</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>👉 练习：把 <code>/api/todo</code> 的读取分别用「默认」「revalidate:10」「no-store」三种方式包一层，观察刷新行为差异。</p>
    </main>
  )
}

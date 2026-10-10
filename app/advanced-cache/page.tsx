// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· Next 缓存策略（框架特定）
// · Vue2/Vue3 对照：Vue 本身无 HTTP 缓存抽象；Nuxt 有 useFetch/useAsyncData 的缓存与重新验证（与 Next 思路接近）；
// · React/Next 对照：Next 对 fetch/路由有「默认缓存 / revalidate / no-store / unstable_cache+tag」四档，本例服务端组件直接演示。
// 📌 实战定位：缓存策略【了解即可·进阶】；Next 全栈项目调性能/新鲜度必点，业务接口常用 no-store 保实时。
// 🧭 学习模式：🔧固定写法=fetch 的 next.revalidate / cache:'no-store' / unstable_cache+revalidateTag；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">缓存抽象</td><td className="px-2 py-1">Vue 无；Nuxt useFetch 缓存</td><td className="px-2 py-1">Next fetch 四档策略</td></tr>
            <tr className="border-b"><td className="px-2 py-1">定时刷新</td><td className="px-2 py-1">Nuxt revalidate</td><td className="px-2 py-1">next: { revalidate }</td></tr>
            <tr className="border-b"><td className="px-2 py-1">强制实时</td><td className="px-2 py-1">手写不缓存</td><td className="px-2 py-1">cache: 'no-store'</td></tr>
            <tr className="border-b"><td className="px-2 py-1">函数级缓存</td><td className="px-2 py-1">Nuxt 类似</td><td className="px-2 py-1">unstable_cache + revalidateTag</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Next 缓存四档；业务接口常用 no-store 保实时，静态数据才缓存。本项目数据统一走 /api 真实接口。</p>
      </details>

    </main>
  )
}

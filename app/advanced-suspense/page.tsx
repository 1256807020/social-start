// ╔══════════════════════════════════════════════════════════
// 【本示例讲什么】
//   从 Vue 转 React（并发篇）——教 React 如何用「一个 Suspense 边界」优雅承载异步数据加载：
//   <Suspense fallback> 包住异步子组件，pending 时显示 loading 态，数据回来自动切换；
//   同步对比 Vue2（手写 loading 态、无内置 Suspense）/ Vue3（内置 <Suspense> + async setup）。
//   数据层对齐项目铁律——走真实 GET /api/todo（信封 {code,data,msg}，客户端解包 j.data||[]），
//   加 600/1200ms 人工延迟只为把 loading 态放慢给人看，去掉功能不变。
//
// 【为什么「跑起来这么久」】
//   不是后端问题（curl /api/todo 正常返回 code:0 + 真实列表），而是本环境的运行期坑：
//   在 Next16 + React19.2 + StrictMode 的 SSR 下，「抛 Promise 触发 Suspense」会失效——
//   服务端预渲染时抛出一个永不 resolve 的 promise，把 Suspense 边界钉死在 fallback，
//   客户端即便 promise resolve 也【不再重渲染】（use(promise) 与 throw promise 两种写法均实测卡死）。
//   定位耗时主要在这一步：接口正常却永远转圈，需两条路径都实测失效后才能确定根因，
//   最终改用 useEffect + useState 取数（等价于 basic/todo-client 写法）才跑通。Suspense 概念仍适用，
//   只是演示用的取数方式从「抛 Promise」换成「更稳的 effect」。
// ╚══════════════════════════════════════════════════════════
// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（并发篇）· Suspense + 资源预取 + use()
// · Vue2 对照：无内置 Suspense；异步数据靠路由守卫 / axios 后赋值，加载态手写；
// · Vue3 对照：有内置 <Suspense> 组件 + async setup()/defineAsyncComponent，fallback 写法类似；
// · React 对照：<Suspense fallback> 包异步子组件，use() 读资源（pending 自动挂起）。
// 📌 实战定位：异步加载边界【了解即可·进阶】；SSR 数据流 / 代码分割必懂，但日常多在框架层已封装。
// 🧭 学习模式：🔧固定写法=useEffect 取数 + 手动 loading 态（本项目 Next16+React19.2+StrictMode 下最稳）；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// 注：本例已对齐项目铁律——数据走真实 GET /api/todo（统一信封 {code,data,msg}，客户端解包 j.data||[]），不再用合成假数据。
// ⚠️ 重要坑（本项目实测）：在 Next16 + React19.2 + StrictMode 的 SSR 下，「抛 Promise 触发 Suspense」会失效——
//    服务端预渲染时抛出一个永不 resolve 的 promise，把 Suspense 边界钉死在 fallback，
//    客户端即便 promise resolve 也【不再重渲染】（use(promise) 与「throw promise」两种写法都实测卡死）。
//    故本例改用 useEffect + useState 取数（等价于 basic/todo-client 写法）， Suspense 概念仍适用，只是数据获取用 effect 更稳。
// ───────────────────────────────────────────────────────────
'use client'

import { useState, useEffect } from 'react'

type Todo = { id: number | string; title: string; done?: boolean }

/**
 * 👉 真·取数 Hook：项目自带 GET /api/todo（铁律：learn 案例必须走 /api，禁止直读 json / 自造信封）。
 * GET 是开放读操作、无需 adminToken，信封结构 { code, data, msg }，成功 code===0，
 * 客户端统一解包 j.data||[]（照 basic 范本 app/todo-client/page.tsx 的写法）。
 *
 * 为什么外面还要套一层「人工延迟」setTimeout？
 *   —— 真实 /api 请求毫秒级就返回，加载态会一闪而过，肉眼根本看不出「加载→恢复」的过程。
 *      这层延迟纯粹为了「把加载过程放慢给人看」，和「是否走 /api」「数据真假」毫无关系；
 *      去掉它功能完全一样，只是演示不出 loading 态。
 *
 * 为什么用相对路径 fetch('/api/todo') 而不是 http://localhost:4000？
 *   —— 本页是 'use client' 组件，跑在浏览器里，相对路径会被浏览器自动按当前 origin 拼接
 *      （如 http://localhost:4000/api/todo），所以不需要、也不能用服务端才有的 headers() 推导 host。
 */
function useTodos(delayMs: number) {
  // null = 加载中；数组 = 已加载（可能为空）
  const [todos, setTodos] = useState<Todo[] | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return // 服务端不取数，避免水合不一致
    // ⏱️ 超时兜底：fetch 一旦「挂起不返回」（如经 IDE 预览/webview 打开、/api 没被转发到后端），
    //    用 AbortController 设 8s 上限，超时也落空数组，保证 loading 态一定会结束、不会永久转圈。
    const ctrl = new AbortController()
    const guard = setTimeout(() => ctrl.abort(), 8000)
    let active = true // 防止组件卸载后 setState
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/todo', { signal: ctrl.signal }) // 相对路径，浏览器端自动拼当前 origin
        const j = await res.json()
        if (active) setTodos(Array.isArray(j.data) ? (j.data as Todo[]) : []) // 解包信封，照 basic 范本 j.data||[]
      } catch (e: unknown) {
        // 失败/超时都给空数组，避免整页崩溃；把原因打到 console 方便定位（是网络挂起还是 404）
        console.warn('[advanced-suspense] /api/todo 取数失败：', e)
        if (active) setTodos([])
      } finally {
        clearTimeout(guard)
      }
    }, delayMs)
    return () => {
      active = false
      clearTimeout(t)
      ctrl.abort()
    }
  }, [delayMs])

  return todos
}

function TodoList({ delayMs, label }: { delayMs: number; label: string }) {
  const todos = useTodos(delayMs)
  // 👉 手动 loading 态（等价于 Suspense 的 fallback）：todos 为 null 时显示加载中
  if (todos === null) return <p>加载{label}（真实 /api/todo）…</p>
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, margin: '8px 0' }}>
      <h3 style={{ margin: '0 0 6px' }}>
        {label}（共 {todos.length} 条，真实来自 /api/todo）
      </h3>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {todos.slice(0, 5).map((t: Todo) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
      {todos.length > 5 && <p style={{ color: '#888', margin: '4px 0 0' }}>…仅显示前 5 条</p>}
    </div>
  )
}

export default function SuspensePage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Suspense 进阶：资源预取（真实 /api/todo）</h1>
      <p>
        注：React 19 已移除实验性的 <code>SuspenseList</code>。本例用更通用的
        useEffect + useState 取数（带人工延迟 600ms / 1200ms），可看到两个列表
        <strong>各自独立</strong>地「加载→出现」。Suspense 概念仍适用，只是本项目 SSR 环境下
        抛 Promise 的写法会卡死（见文末对照表「注意」一行）。
      </p>
      <TodoList delayMs={600} label="列表 A" />
      <TodoList delayMs={1200} label="列表 B" />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">异步边界</td>
              <td className="px-2 py-1">无内置</td>
              <td className="px-2 py-1">&lt;Suspense&gt; 组件</td>
              <td className="px-2 py-1">&lt;Suspense&gt; + use() / useEffect</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">读取资源</td>
              <td className="px-2 py-1">手写赋值</td>
              <td className="px-2 py-1">async setup</td>
              <td className="px-2 py-1">use(promise) 或 useEffect+setState（本例）</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">加载态</td>
              <td className="px-2 py-1">手写 loading</td>
              <td className="px-2 py-1">fallback slot</td>
              <td className="px-2 py-1">手动 loading 态 / fallback prop</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">数据来源</td>
              <td className="px-2 py-1">手写 / axios</td>
              <td className="px-2 py-1">axios / fetch</td>
              <td className="px-2 py-1">真实 fetch /api/todo（本例对齐铁律）</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">注意</td>
              <td className="px-2 py-1">—</td>
              <td className="px-2 py-1">内置</td>
              <td className="px-2 py-1">
                ⚠️ 本项目 Next16+React19.2+StrictMode 下「抛 Promise 触发 Suspense」SSR 后不重渲染，故用 useEffect 取数
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">
          📝 小结：Suspense 做异步加载边界；Vue3 也有内置 &lt;Suspense&gt;，写法接近。
          本例把假数据换成真实 /api/todo，并因 SSR 环境限制改用 useEffect+useState 取数，
          保留人工延迟只为让 loading 态看得见。
        </p>
      </details>
    </main>
  )
}

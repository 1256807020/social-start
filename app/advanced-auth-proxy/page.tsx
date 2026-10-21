// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· BFF / 鉴权代理
// · Vue2/Vue3 对照：Vue 本身无 BFF 概念；Nuxt 用 server route（nitro event handler / @nuxtjs/proxy）做同源代理、注入 token；
// · React/Next 对照：本例前端只调同源 /advanced-auth-proxy/*，由 Route Handler 注入凭证转发真实后端，token 不落前端。
// 📌 实战定位：鉴权代理【了解即可·进阶】；BFF 是企业级常用手法，隐藏真实后端、统一限流/兜底。
// 🧭 学习模式：🔧固定写法=前端调同源代理 + route 注入 token 转发；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
//
// 本文件是一次「完整例子」的演示页，包含两种调用代理的方式：
//   ① 服务端渲染时（SSR）直接经代理拉数据 —— 见下方 getViaProxy()
//   ② 浏览器运行时点按钮经代理拉数据 —— 见 ./ProxyDemo.tsx（'use client'）
// 两者都只跟 /advanced-auth-proxy/* 打交道，token 由服务端 route 注入，前端无感知。
// ───────────────────────────────────────────────────────────
import { headers } from 'next/headers'

import ProxyDemo from './ProxyDemo'

type Todo = { id: number | string; title: string; done?: boolean }

/**
 * 服务端内网调用：从当前请求的 host 推导出绝对 base URL。
 * 为什么不直接写死 'http://localhost:4000'？
 *   - 换端口 / 部署到别的域名时会失效；从 headers 拿 host 就永远对得上。
 *   - 注意：这是「服务端代码」读请求头，和浏览器无关，不会把 host 泄露给前端。
 */
async function buildBase() {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:4000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

/**
 * ① 服务端经 BFF 代理拉取数据（在 SSR 阶段执行）。
 * 关键点：这里 fetch 的是「自己的同源代理」/advanced-auth-proxy/api/todo，
 *        由 route.ts 在【服务端】补上 token 再转发真实 /api/todo。
 * 对浏览器而言，它只收到最终渲染好的 HTML，全程没有 token、没有真实后端地址。
 */
async function getViaProxy() {
  try {
    const base = await buildBase()
    // 走代理，而不是直接 fetch('/api/todo') —— 区别就在于这一跳会过 route.ts 注入凭证
    const res = await fetch(`${base}/advanced-auth-proxy/api/todo?pageSize=3`)
    const json = await res.json()
    const list: Todo[] = Array.isArray(json?.data) ? json.data : []
    return { ok: true as const, count: list.length, items: list.slice(0, 3), error: null }
  } catch (e) {
    return { ok: false as const, count: 0, items: [], error: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * 本页是「服务端组件（Server Component）」：默认在服务器渲染，可以直接 await 取数。
 * 它负责 ① 的服务端取数 + 页面骨架；交互部分（按钮）下沉到 ProxyDemo（客户端组件）。
 */
export default async function AuthProxyPage() {
  // 渲染前先在服务端经代理取一次数，证明「服务端这侧」已经能走通 BFF
  const proxied = await getViaProxy()

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>鉴权代理（BFF）</h1>
      <p>
        浏览器 → <code>/advanced-auth-proxy/...</code>（同源，安全）→
        服务端 route 注入 token → 真实后端。
      </p>
      <p>👉 好处：token 不落前端、隐藏真实 API 地址、可统一限流/兜底。</p>

      <div className="space-y-4">
        {/* ① 服务端（SSR）经代理拉取：token 在服务端注入，浏览器只看到渲染结果 */}
        <section className="rounded border p-3 text-sm">
          <h2 className="font-bold">① 服务端经 BFF 代理拉取（SSR）</h2>
          <p className="text-gray-500">
            本页服务端渲染时直接走 <code>/advanced-auth-proxy/api/todo</code>，由 route 注入 token 转发。
          </p>
          {proxied.error ? (
            <p style={{ color: '#e33' }}>失败：{proxied.error}</p>
          ) : (
            <div className="mt-2">
              <p>代理返回条数：<b>{proxied.count}</b></p>
              <ul className="list-disc pl-5">
                {proxied.items.map((t) => (
                  <li key={String(t.id)}>
                    {t.title} {t.done ? '✅' : '⬜'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ② 浏览器端按钮演示：交给客户端组件，证明浏览器侧也只调同源、代码里无 token */}
        <ProxyDemo />
      </div>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3 (Nuxt)</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">BFF 代理</td><td className="px-2 py-1">nitro server route</td><td className="px-2 py-1">Route Handler 代理（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">token 安全</td><td className="px-2 py-1">服务端注入，不落前端</td><td className="px-2 py-1">服务端注入，不落前端</td></tr>
            <tr className="border-b"><td className="px-2 py-1">好处</td><td className="px-2 py-1">隐藏真实后端 / 限流</td><td className="px-2 py-1">隐藏真实后端 / 限流</td></tr>
            <tr className="border-b"><td className="px-2 py-1">用途</td><td className="px-2 py-1">企业级</td><td className="px-2 py-1">企业级</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：BFF 同源代理隐藏真实后端、token 不落前端；Vue/Nuxt 用 server route 同理。</p>
      </details>
    </main>
  )
}

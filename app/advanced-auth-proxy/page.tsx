// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· BFF / 鉴权代理
// · Vue2/Vue3 对照：Vue 本身无 BFF 概念；Nuxt 用 server route（nitro event handler / @nuxtjs/proxy）做同源代理、注入 token；
// · React/Next 对照：本例前端只调同源 /advanced-auth-proxy/*，由 Route Handler 注入凭证转发真实后端，token 不落前端。
// 📌 实战定位：鉴权代理【了解即可·进阶】；BFF 是企业级常用手法，隐藏真实后端、统一限流/兜底。
// 🧭 学习模式：🔧固定写法=前端调同源代理 + route 注入 token 转发；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
/**
 * 高阶：BFF / 鉴权代理（对照 app/advanced-auth-proxy/route.ts）
 * 前端只调同源的 /advanced-auth-proxy/*，由服务端 route 注入凭证转发到真实后端。
 */
export default function AuthProxyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>鉴权代理（BFF）</h1>
      <p>
        浏览器 → <code>/advanced-auth-proxy/...</code>（同源，安全）→
        服务端 route 注入 token → 真实后端。
      </p>
      <p>👉 好处：token 不落前端、隐藏真实 API 地址、可统一限流/兜底。</p>
      <p>👉 练习：在 route.ts 补全转发后，本页用 fetch 调同源代理接口验证。</p>
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

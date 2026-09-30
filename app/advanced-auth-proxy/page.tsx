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
    </main>
  )
}

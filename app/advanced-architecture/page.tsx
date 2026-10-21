// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（架构篇）· 分层架构
// · Vue2/Vue3 对照：Nuxt 同样分层——pages(UI) / server(路由适配) / composables·stores(纯逻辑) / 统一响应信封；
// · React/Next 对照：本仓库 app/(UI) + app/api(适配层) + lib/(纯函数/存储/信封) 严格解耦，Route Handler 只做「接参→调纯函数→包装」。
// 📌 实战定位：分层架构【了解即可·进阶】；这是「不被框架绑架、纯逻辑可复用可单测」的核心纪律。
// 🧭 学习模式：🔧固定写法=lib/ 纯函数 + toResponse(withApi(...))；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
/**
 * 高阶：工程化 / 分层架构（搬运自进阶大纲 advanced-architecture）
 *  本项目（social-start）的分层是教科书式的「纯逻辑 ↔ 框架适配」解耦：
 *
 *  app/                 → 页面（UI），'use client' 边界清晰
 *  app/api/[resource]   → Route Handlers（框架适配层，只做参数解析/包装）
 *  lib/crud.ts          → 纯 CRUD 逻辑（不依赖 Next，可单测、可搬进其它框架）
 *  lib/query.ts         → 纯查询/分页/排序/树形（纯函数）
 *  lib/json-db.ts       → 存储（原子写 + 串行队列）
 *  lib/response.ts      → 统一信封 { code,data,msg } + withApi
 *  lib/route-utils.ts   → toResponse() 把 ApiResult 包成 NextResponse
 *
 *  关键纪律（已踩坑）：
 *   - Route Handler 必须 return toResponse(withApi(...))，严禁裸 return withApi(...)
 *   - 业务逻辑放 lib/ 纯函数，框架层只做「接参数 → 调纯函数 → 包装响应」
 */
export default function ArchitecturePage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>分层架构</h1>
      <h2>为什么这样分？</h2>
      <ul>
        <li>纯逻辑（lib/）可被 Next / Nuxt / 测试 复用，不被框架绑架</li>
        <li>Route Handler 极薄，改框架几乎只改这一层</li>
        <li>统一信封让前端一套解析逻辑通吃所有接口</li>
      </ul>
      <h2>👉 练习</h2>
      <ol>
        <li>在 <code>lib/crud.ts</code> 照葫芦画瓢，给某个新资源加一个 list 处理函数</li>
        <li>在 <code>app/api/[resource]/[id]/route.ts</code> 接上它，用 toResponse(withApi(...)) 返回</li>
        <li>为这个纯函数写一条 vitest（参考 learn/advanced-engineering）</li>
      </ol>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3 (Nuxt)</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">UI 层</td><td className="px-2 py-1">pages/</td><td className="px-2 py-1">app/</td></tr>
            <tr className="border-b"><td className="px-2 py-1">适配层</td><td className="px-2 py-1">server/ routes</td><td className="px-2 py-1">app/api/</td></tr>
            <tr className="border-b"><td className="px-2 py-1">纯逻辑</td><td className="px-2 py-1">composables · stores</td><td className="px-2 py-1">lib/ 纯函数</td></tr>
            <tr className="border-b"><td className="px-2 py-1">响应信封</td><td className="px-2 py-1">统一 {"{code,data,msg}"}</td><td className="px-2 py-1">lib/response 信封</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：分层核心 = 纯逻辑与框架解耦；Route Handler 极薄，改框架只改适配层。本项目所有数据均走 /api 真实接口。</p>
      </details>

    </main>
  )
}

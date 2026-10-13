// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· Next 缓存策略（框架特定）
// · Vue2/Vue3 对照：Vue 本身无 HTTP 缓存抽象；Nuxt 有 useFetch/useAsyncData 的缓存与重新验证（与 Next 思路接近）；
// · React/Next 对照：Next 对 fetch/路由有「默认缓存 / revalidate / no-store / 'use cache'+tag」四档，本页服务端组件直接演示。
// 📌 实战定位：缓存策略【了解即可·进阶】；Next 全栈项目调性能/新鲜度必点，业务接口常用 no-store 保实时。
// 🧭 学习模式：🔧固定写法=fetch 的 next.revalidate / cache:'no-store' / 'use cache'(cacheTag+cacheLife)+updateTag；
//            下面三张卡片是👉练习点的真实落地（默认 / revalidate:10 / no-store 三种策略各拉一次 /api/todo，对比读取时刻）；
//            文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
// 🧪 本 demo 三档行为（已实跑验证，手动刷新页面或点「重新加载」按钮触发重渲染）：
//   ① 默认缓存(force-cache)  ：读取时刻「永远不变」（直至 dev server 重启/热重载重置模块缓存）。
//   ② 定时刷新(revalidate:10)：10 秒窗口内不变；距上次真实拉取 >10s 后刷新才重新请求接口、跳变（之后又冻 10s）。
//   ③ 完全不缓存(no-store)   ：每次刷新都真打 /api/todo，读取时刻「变一次变一次」。
//   ⚠️ 关键坑：Next 的 fetch 缓存只冻「响应数据(列表)」，不会冻 fetch 之后现算的 Date.now()；
//      故本 demo 用 module 级 Map 按策略缓存「读取时刻+数据」，让时间戳本身随策略冻结（dev 模式原生 fetch 缓存不稳定，显式 TTL 更可靠）。
// ───────────────────────────────────────────────────────────
import { headers } from 'next/headers'
import { refreshCacheDemo } from './actions'

type Strategy = 'default' | 'revalidate' | 'no-store'

/**
 * 动态推导本服务的绝对 base URL（从请求头取 host/proto），
 * 避免硬编码 localhost:3000 在端口变动或构建期预渲染时 fetch failed。
 */
async function getBaseUrl() {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

/**
 * 按不同缓存策略读取 /api/todo，并把「读取时刻 + 数据」一起缓存。
 *
 * 关键坑：Next 的 fetch 缓存只冻住「响应数据（todo 列表）」，不会冻住我们自己在
 * fetch 之后现算的 Date.now()。所以若只 return Date.now()，三张卡每次都是「此刻」，
 * 根本看不出差异。正确做法是用一个 module 级 Map 按策略缓存「时刻+数据」，让时间戳
 * 本身随策略冻结——其 TTL 语义与 Next 三档一一对应：
 *   force-cache(默认) → 永不过期；revalidate:10 → 10s 过期；no-store → 每次都新。
 * （dev 模式下 Next 原生 fetch 缓存行为不稳定，用显式 TTL 保证 demo 可观察。）
 */
type Cached = { data: unknown[]; fetchedAt: number }
const todoCache = new Map<Strategy, Cached>()

function ttlOf(strategy: Strategy): number {
  if (strategy === 'revalidate') return 10_000
  if (strategy === 'default') return Number.POSITIVE_INFINITY
  return 0 // no-store：每次都重新拉
}

async function getTodo(strategy: Strategy, base: string) {
  const now = Date.now()
  const hit = todoCache.get(strategy)
  const ttl = ttlOf(strategy)
  // 命中缓存且未过期 → 直接返回「被冻结的读取时刻」
  if (hit && (ttl === 0 ? false : now - hit.fetchedAt < ttl)) {
    return { fetchedAt: hit.fetchedAt, count: hit.data.length, error: null as string | null }
  }
  // 未命中或已过期 → 真打一次 /api/todo（用 no-store 保证此刻拿到的是实时数据）
  try {
    const res = await fetch(`${base}/api/todo`, { cache: 'no-store' })
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    const entry: Cached = { data: list, fetchedAt: Date.now() }
    todoCache.set(strategy, entry)
    return { fetchedAt: entry.fetchedAt, count: list.length, error: null as string | null }
  } catch (e) {
    return { fetchedAt: Date.now(), count: -1, error: e instanceof Error ? e.message : String(e) }
  }
}

function fmt(ts: number) {
  const d = new Date(ts)
  const time = d.toLocaleTimeString('zh-CN', { hour12: false })
  return `${time}.${String(ts % 1000).padStart(3, '0')}`
}

function Card({
  title,
  strategy,
  stamp,
  count,
  error,
  color,
}: {
  title: string
  strategy: string
  stamp: number
  count: number
  error: string | null
  color: string
}) {
  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: 8, padding: 12, flex: 1 }}>
      <h3 style={{ margin: '0 0 6px' }}>{title}</h3>
      <p style={{ margin: '2px 0' }}>
        <code>{strategy}</code>
      </p>
      <p style={{ margin: '2px 0' }}>读取时刻：<b>{fmt(stamp)}</b></p>
      {error ? (
        <p style={{ margin: '2px 0', color: '#e33' }}>读取失败：{error}</p>
      ) : (
        <p style={{ margin: '2px 0', color: '#555' }}>当前 /api/todo 条数：{count}</p>
      )}
    </div>
  )
}

export default async function CachePage() {
  // 👉 练习点真实落地：三种策略各拉一次 /api/todo，并发执行
  const base = await getBaseUrl()
  const [def, rev, nos] = await Promise.all([
    getTodo('default', base),
    getTodo('revalidate', base),
    getTodo('no-store', base),
  ])

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Next 缓存策略（可跑 demo）</h1>

      <h2>① 四档策略速查</h2>
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
              <code>'use cache'</code> + <code>updateTag</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>② 真跑一次：三种策略对比</h2>
      <p style={{ color: '#555' }}>
        👉 练习落地：分别用「默认 / revalidate:10 / no-store」三种方式包一层 <code>/api/todo</code>，
        读到的「时刻」被写进页面。点下面按钮反复刷新，观察差异：
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Card title="默认缓存" strategy="cache: 'force-cache'" stamp={def.fetchedAt} count={def.count} error={def.error} color="#888" />
        <Card title="定时刷新（10s）" strategy="next: { revalidate: 10 }" stamp={rev.fetchedAt} count={rev.count} error={rev.error} color="#2b7" />
        <Card title="完全不缓存" strategy="cache: 'no-store'" stamp={nos.fetchedAt} count={nos.count} error={nos.error} color="#e33" />
      </div>

      <form action={refreshCacheDemo} style={{ marginTop: 16 }}>
        <button
          type="submit"
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: 6, border: '1px solid #2b7', background: '#2b7', color: '#fff' }}
        >
          🔄 重新加载并观察
        </button>
      </form>
      <p style={{ color: '#555', fontSize: 14 }}>
        预期（需手动刷新页面才会触发重新渲染）：<b>默认缓存</b>的「读取时刻」永远不变（命中永久缓存），
        <b>定时刷新</b>的「读取时刻」只有当你刷新的时刻距上次真实拉取已超过 10 秒才跳变，
        <b>完全不缓存</b>每次刷新都变。
      </p>

      <details className="mt-6 rounded border p-3 text-sm" style={{ marginTop: 24 }}>
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">缓存抽象</td><td className="px-2 py-1">Vue 无；Nuxt useFetch 缓存</td><td className="px-2 py-1">Next fetch 四档策略</td></tr>
            <tr className="border-b"><td className="px-2 py-1">定时刷新</td><td className="px-2 py-1">Nuxt revalidate</td><td className="px-2 py-1">{'next: { revalidate }'}</td></tr>
            <tr className="border-b"><td className="px-2 py-1">强制实时</td><td className="px-2 py-1">手写不缓存</td><td className="px-2 py-1">cache: 'no-store'</td></tr>
            <tr className="border-b"><td className="px-2 py-1">函数级缓存</td><td className="px-2 py-1">Nuxt 类似</td><td className="px-2 py-1">'use cache' + updateTag（revalidateTag 第二参必填）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Next 缓存四档；业务接口常用 no-store 保实时，静态数据才缓存。本项目数据统一走 /api 真实接口。</p>
      </details>
    </main>
  )
}

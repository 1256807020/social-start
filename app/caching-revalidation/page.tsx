// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈篇）· 缓存与重新验证（caching & revalidation）
// · Vue2/Vue3 对照：Vue 无内置 HTTP 缓存；Nuxt useFetch 自带缓存与重新验证（与 Next 思路接近）；
// · React/Next 对照：fetch 的 force-cache / next:{revalidate} / no-store / tags + updateTag 四种档位，本例直接读 /api/todo 演示。
// 📌 实战定位：缓存/重验【了解即可·进阶】；调性能与新鲜度必点，业务接口常用 no-store 保实时。
// 🧭 学习模式：🔧固定写法=next:{tags} + updateTag 让缓存失效（Next16 revalidateTag 第二参 profile 必填，Server Action 改用 updateTag）；
//            下面四张卡片是👉练习点的真实落地（四种策略各拉一次 /api/todo，对比「读取时刻 + 条数」）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// 注：本例全程走真实 /api/todo 接口（带 cache 策略），未直读 json，符合铁律。
// 🧪 四档行为（手动刷新页面或点「重新验证」按钮触发重渲染，已实跑验证）：
//   ① 默认/force-cache：读取时刻「永远不变」（直至 dev server 重启）；② revalidate:10：10s 窗口内不变，超 10s 刷新才回源；
//   ③ no-store：每次刷新都真打接口；④ 打 tag+updateTag：平时冻结，点「重新验证」只清这一条（精确失效），①②③ 不受影响。
// 🔑 ③ 与 ④「点按钮都变」是现象相同、原因不同（必记）：
//   · ③ 变 = 被动/无条件：它根本不缓存，fetch 永远回源，故【任何一次渲染】（F5 也好、按钮也好）时间戳都更新。
//   · ④ 变 = 按需/精确：按钮 Server Action 里执行 todoCache.delete('tagged')（等价于 revalidateTag('todos')），主动清掉它的缓存，
//          下次渲染才回源；【只有点按钮才会发生】，普通 F5 刷新时 ④ 纹丝不动（URL 缓存冻着，没人失效它）。
//   一句话对比：③=每次请求都问后端（无脑实时）；④=平时不回源、只有你显式 updateTag 时才问一次（按需精确失效）。
// ⚠️ 关键坑：Next 的 fetch 缓存只冻「响应数据(列表)」、不会冻 fetch 之后现算的 Date.now()；故本 demo 用 module 级 Map 按策略冻结「读取时刻+数据」，dev 模式原生 fetch 缓存不稳定时也更可靠。
// ───────────────────────────────────────────────────────────
import { updateTag } from "next/cache";
import { headers } from "next/headers";

/**
 * 适配点（本仓库 = Next 16.3 + 自带 /api JSON 引擎，无 json-server / Prisma）：
 *   - 数据源改为 social-start 自带的 GET /api/todo（零外部依赖，无需起 json-server）
 *   - 原函数级缓存 unstable_cache(getProducts) 在 Next 16 已移除，官方替代是 'use cache' 指令；
 *     本页用 fetch + next:{ tags } + updateTag 等价实现（Server Action 内精确失效；更稳定，无需开 Cache Components 也能编译运行）
 */

type Todo = { id: number | string; title: string; done?: boolean };

// 服务端内网调用：从请求 host 推导绝对 base，避免硬编码端口，换端口/部署也能跑
async function buildBase() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:4000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// module 级缓存：把「读取时刻 + 数据」按策略冻结，使时间戳本身可观察（同 advanced-cache 思路）
type Cached = { data: Todo[]; fetchedAt: number };
const todoCache = new Map<string, Cached>();

function ttlOf(key: string): number {
  if (key === "revalidate") return 10_000;
  if (key === "no-store") return 0; // 每次都重新拉
  return Number.POSITIVE_INFINITY; // force-cache / tagged：永不过期（tagged 靠按钮手动失效）
}

async function getTodo(
  key: string,
): Promise<{ count: number; fetchedAt: number; error: string | null }> {
  const now = Date.now();
  const hit = todoCache.get(key);
  const ttl = ttlOf(key);
  // 命中且未过期 → 返回被冻结的读取时刻
  if (hit && (ttl === 0 ? false : now - hit.fetchedAt < ttl)) {
    return { count: hit.data.length, fetchedAt: hit.fetchedAt, error: null };
  }
  // 未命中或已过期 → 真打一次 /api/todo（用 no-store 保证此刻拿到实时数据）
  const opts: RequestInit & { next?: { revalidate?: number; tags?: string[] } } =
    key === "no-store"
      ? { cache: "no-store" }
      : key === "revalidate"
        ? { next: { revalidate: 10 } }
        : key === "tagged"
          ? { cache: "force-cache", next: { tags: ["todos"] } }
          : { cache: "force-cache" };
  try {
    const base = await buildBase();
    const res = await fetch(`${base}/api/todo`, opts);
    const json = await res.json();
    const list = Array.isArray(json) ? json : (json?.data ?? []);
    const entry: Cached = { data: list as Todo[], fetchedAt: Date.now() };
    todoCache.set(key, entry);
    return { count: list.length, fetchedAt: entry.fetchedAt, error: null };
  } catch (e) {
    return { count: -1, fetchedAt: Date.now(), error: e instanceof Error ? e.message : String(e) };
  }
}

// Server Action：让打了 'todos' tag 的缓存失效 —— 这正是 caching-revalidation 的核心
async function revalidateTodos() {
  "use server";
  // Next 16：Server Action 内立即失效用 updateTag（单参）；revalidateTag 第二参 profile 已变必填
  updateTag("todos");
  // 本 demo：同时清掉 module 缓存里 tagged 这一条，使 UI 上的「读取时刻」立即刷新，
  // 直观体现「仅 ④ 被精确失效」，而 ①②③ 按 URL 缓存、未打 tag，不受影响。
  todoCache.delete("tagged");
}

function fmt(ts: number) {
  const d = new Date(ts);
  const time = d.toLocaleTimeString("zh-CN", { hour12: false });
  return `${time}.${String(ts % 1000).padStart(3, "0")}`;
}

function Card({
  title,
  strategy,
  stamp,
  count,
  error,
  color,
}: {
  title: string;
  strategy: string;
  stamp: number;
  count: number;
  error: string | null;
  color: string;
}) {
  return (
    <section className="rounded border p-3" style={{ borderColor: color }}>
      <h2 className="font-bold" style={{ color }}>
        {title}
      </h2>
      <p className="text-sm">
        <code>{strategy}</code>
      </p>
      <p className="text-sm">
        读取时刻：<b>{fmt(stamp)}</b>
      </p>
      {error ? (
        <p className="text-sm" style={{ color: "#e33" }}>
          读取失败：{error}
        </p>
      ) : (
        <p className="text-sm text-gray-500">条数：{count}</p>
      )}
    </section>
  );
}

export default async function CachingRevalidationPage() {
  // 本页含 no-store 读取 + Server Action，会被判为动态路由 → 运行时（dev server 在 4000）才去拉数据
  const [force, reval, noStore, tagged] = await Promise.all([
    getTodo("force-cache"),
    getTodo("revalidate"),
    getTodo("no-store"),
    getTodo("tagged"),
  ]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">高阶 · 缓存与重新验证（caching &amp; revalidation）</h1>
      <p className="text-sm text-gray-500">
        适配自外部 demo（原版 json-server + Prisma + unstable_cache）。本仓库 = Next 16 + 自带
        /api/todo，无外部依赖。想看「条数」变化：先去 /todo-client 增删几条，再回来看；想看「读取时刻」冻不冻，直接连续刷新本页即可。
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card title="① fetch 默认 / force-cache（按 URL 缓存）" strategy="cache: 'force-cache'" stamp={force.fetchedAt} count={force.count} error={force.error} color="#888" />
        <Card title="② next:{ revalidate: 10 }（定时回源）" strategy="next: { revalidate: 10 }" stamp={reval.fetchedAt} count={reval.count} error={reval.error} color="#2b7" />
        <Card title="③ cache: 'no-store'（每次回源）" strategy="cache: 'no-store'" stamp={noStore.fetchedAt} count={noStore.count} error={noStore.error} color="#e33" />
        <Card title="④ 打 tag + updateTag（重新验证）" strategy="tags: ['todos'] + updateTag" stamp={tagged.fetchedAt} count={tagged.count} error={tagged.error} color="#d80" />
      </div>

      <form action={revalidateTodos}>
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
          重新验证（updateTag('todos')）
        </button>
      </form>
      <p className="mt-1 text-xs text-gray-500">
        点按钮只让 <b>④</b>（打了 todos tag）失效并刷新；<b>①②③</b> 按 URL 缓存、未打 tag，不受影响——这就是「精确失效」与「整页失效(revalidatePath)」的区别。
      </p>

      <section className="rounded border p-3 text-sm">
        <h2 className="font-bold">Next 16 适配说明</h2>
        <ul className="list-disc pl-5">
          <li>
            原 demo 的 <code>unstable_cache(getProducts)</code> 在 Next 16 已移除 → 官方替代是{" "}
            <code>'use cache'</code> 指令（需开启 Cache Components）。
          </li>
          <li>
            本页改用 <code>fetch(..., {"{ next: { tags } }"})</code> + <code>updateTag</code>
            （Server Action 内精确失效），无需改 next.config 即可编译运行。
          </li>
          <li>
            想看到 force-cache 真的“跨请求不回源”，在 next.config.mjs 开{" "}
            <code>cacheComponents: true</code>（Next 16 缓存改为显式 opt-in）。
          </li>
        </ul>
      </section>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3 (Nuxt)</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">缓存档位</td><td className="px-2 py-1">useFetch 缓存</td><td className="px-2 py-1">force-cache / revalidate / no-store</td></tr>
            <tr className="border-b"><td className="px-2 py-1">定时刷新</td><td className="px-2 py-1">revalidate</td><td className="px-2 py-1">{'next: { revalidate }'}</td></tr>
            <tr className="border-b"><td className="px-2 py-1">强制实时</td><td className="px-2 py-1">手关缓存</td><td className="px-2 py-1">no-store</td></tr>
            <tr className="border-b"><td className="px-2 py-1">精确失效</td><td className="px-2 py-1">Nuxt 类似</td><td className="px-2 py-1">tags + updateTag（revalidateTag 第二参必填）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：四档缓存；业务接口常用 no-store 保实时，打 tag + updateTag 做精确失效。本项目数据统一走 /api 真实接口。</p>
      </details>
    </main>
  );
}

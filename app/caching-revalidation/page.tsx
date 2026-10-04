import { revalidateTag } from "next/cache";

/**
 * 高阶 · Next.js 缓存与重新验证（caching & revalidation）
 * 
 *
 * 适配点（本仓库 = Next 16.3 + 自带 /api JSON 引擎，无 json-server / Prisma）：
 *   - 数据源改为 social-start 自带的 GET /api/todo（零外部依赖，无需起 json-server）
 *   - 原函数级缓存 unstable_cache(getProducts) 在 Next 16 已移除，官方替代是 'use cache' 指令；
 *     本页用 fetch + next:{ tags } + revalidateTag 等价实现（更稳定，无需开 Cache Components 也能编译运行）
 */

type Todo = { id: number | string; title: string; done?: boolean };

// ① 默认/强制缓存：同样 URL 的结果按 URL 缓存
async function getForceCache(): Promise<Todo[]> {
  const res = await fetch("http://localhost:4000/api/todo", { cache: "force-cache" });
  return (await res.json()).data;
}

// ② 定时重新验证：允许短暂陈旧，每 10s 回源一次（ISR 思路）
async function getRevalidate(): Promise<Todo[]> {
  const res = await fetch("http://localhost:4000/api/todo", { next: { revalidate: 10 } });
  return (await res.json()).data;
}

// ③ 完全不缓存：每次请求都打后端（私有 / 实时数据）
async function getNoStore(): Promise<Todo[]> {
  const res = await fetch("http://localhost:4000/api/todo", { cache: "no-store" });
  return (await res.json()).data;
}

// ④ 打 tag 的读取：配合 revalidateTag 做“重新验证”
async function getTagged(): Promise<Todo[]> {
  const res = await fetch("http://localhost:4000/api/todo", {
    cache: "force-cache",
    next: { tags: ["todos"] },
  });
  return (await res.json()).data;
}

// Server Action：让打了 'todos' tag 的缓存失效 —— 这正是 caching-revalidation 的核心
async function revalidateTodos() {
  "use server";
  revalidateTag("todos");
}

export default async function CachingRevalidationPage() {
  // 本页含 no-store 读取 + Server Action，会被判为动态路由 → 运行时（dev server 在 4000）才去拉数据
  const force = await getForceCache();
  const reval = await getRevalidate();
  const noStore = await getNoStore();
  const tagged = await getTagged();

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">高阶 · 缓存与重新验证（caching &amp; revalidation）</h1>
      <p className="text-sm text-gray-500">
        适配自外部 demo（原版 json-server + Prisma + unstable_cache）。本仓库 = Next 16 + 自带
        /api/todo，无外部依赖。先去 /todo-client 增删几条，再回来看各区块条数变化。
      </p>

      <section className="rounded border p-3">
        <h2 className="font-bold">① fetch 默认 / force-cache（按 URL 缓存）</h2>
        <p className="text-sm">条数：{force.length}（数据源变更后可能仍显示旧值，直到缓存过期）</p>
      </section>

      <section className="rounded border p-3">
        <h2 className="font-bold">② next:{"{ revalidate: 10 }"}（定时回源）</h2>
        <p className="text-sm">条数：{reval.length}（最多陈旧 10 秒）</p>
      </section>

      <section className="rounded border p-3">
        <h2 className="font-bold">③ cache: 'no-store'（每次回源）</h2>
        <p className="text-sm">条数：{noStore.length}（永远最新）</p>
      </section>

      <section className="rounded border p-3">
        <h2 className="font-bold">④ 打 tag + revalidateTag（重新验证）</h2>
        <p className="text-sm">条数：{tagged.length}</p>
        <form action={revalidateTodos}>
          <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
            重新验证（revalidateTag('todos')）
          </button>
        </form>
        <p className="mt-1 text-xs text-gray-500">
          点按钮会让 ①④ 的缓存失效，下次渲染拿最新数据。
        </p>
      </section>

      <section className="rounded border p-3 text-sm">
        <h2 className="font-bold">Next 16 适配说明</h2>
        <ul className="list-disc pl-5">
          <li>
            原 demo 的 <code>unstable_cache(getProducts)</code> 在 Next 16 已移除 → 官方替代是{" "}
            <code>'use cache'</code> 指令（需开启 Cache Components）。
          </li>
          <li>
            本页改用 <code>fetch(..., {"{ next: { tags } }"})</code> + <code>revalidateTag</code>
            ，无需改 next.config 即可编译运行。
          </li>
          <li>
            想看到 force-cache 真的“跨请求不回源”，在 next.config.mjs 开{" "}
            <code>cacheComponents: true</code>（Next 16 缓存改为显式 opt-in）。
          </li>
        </ul>
      </section>
    </main>
  );
}

// 【next-template · 子页 B】app/next-template/b/page.tsx
export default function PageB() {
  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold">子页 B · /next-template/b</h2>
      <p className="text-sm text-gray-600">
        和 A 是同级路由，共享同一个 layout 与 template —— 正好用来对比两者的挂载行为。
      </p>
    </section>
  )
}

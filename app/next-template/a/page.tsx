// 【next-template · 子页 A】app/next-template/a/page.tsx
export default function PageA() {
  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold">子页 A · /next-template/a</h2>
      <p className="text-sm text-gray-600">
        切到 B 再切回来：上面 layout 的计数不会变，template 的挂载时间会变。
      </p>
    </section>
  )
}

// 【next-template · 首页】app/next-template/page.tsx
// 操作指引：先在本页把 layout 的计数点几下，然后去 A / B 来回切，观察：
//   ① layout 的计数保持不变（没重新挂载）；
//   ② template 的「挂载时间」每次都变（重新挂载）。
export default function TemplateHome() {
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">怎么验证？</h2>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
        <li>在上面「layout 的状态」里点几下 +1，记住数字（比如 3）。</li>
        <li>点「子页 A」，再点「子页 B」。</li>
        <li>
          看 layout 计数：<strong>还是 3</strong>（layout 跨导航保持）；
          看 template 挂载时间：<strong>每次都变</strong>（template 每次重建）。
        </li>
      </ol>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue2 / Vue3 / React 三向对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">行为</th>
              <th className="px-2 py-1">Vue Router</th>
              <th className="px-2 py-1">Next.js App Router</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">保持状态</td>
              <td className="px-2 py-1">&lt;keep-alive&gt; + router-view</td>
              <td className="px-2 py-1">layout.tsx</td>
            </tr>
            <tr>
              <td className="px-2 py-1">强制重建</td>
              <td className="px-2 py-1">router-view :key=fullPath</td>
              <td className="px-2 py-1">template.tsx</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：要「记住」用 layout（侧边栏展开态、滚动位置、全局播放器）；
          要「重置」用 template（入场动画、逐页初始化、清空子组件状态）。
          两者可以并存 —— 本目录就是 layout 包 template 再包 page。
        </p>
      </details>
    </section>
  )
}

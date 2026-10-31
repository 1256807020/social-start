// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Grim.js 篇）· 交互式动态渐变背景
// · Vue2/Vue3 对照：同类效果在 Vue 里同样 new Grim(selector,{colors}) 或直接 CSS 动画；写法与 React 一致。
// · React 对照：用 CSS `@keyframes` + `background-position` 动画驱动流动渐变（本例零依赖实现）。
// 📌 实战定位：高级视觉氛围背景【了解即可·进阶】；零复杂配置生成流动渐变，大量品牌官网用它营造高级感。
// 🧭 学习模式：🔧固定写法=多色 linear-gradient + backgroundSize:'300%' + @keyframes 平移 background-position；👉=练习点已填；文末对照。
// ⚠️ 说明：原 demo 计划引用的 npm 包 `grimjs` 并不真实存在（registry 404），故本例改用纯 CSS 实现等价效果，保证可直接运行。
// ───────────────────────────────────────────────────────────
'use client'

export default function GrimPage() {
  const colors = ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab']
  const duration = 8000

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Grim.js：流动渐变背景</h1>
      <p>
        下方色块由 CSS 动画持续注入流动渐变（原 demo 计划用 Grim.js，但 npm 上并无此包，这里用零依赖 CSS 等价实现，效果一致）。
      </p>
      <div
        style={{
          width: '100%',
          height: 260,
          borderRadius: 12,
          background: `linear-gradient(120deg, ${colors.join(', ')})`,
          backgroundSize: '300% 300%',
          animation: `grimShift ${duration / 1000}s ease infinite`,
        }}
      />
      <style>{`
        @keyframes grimShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">库</td><td className="px-2 py-1">Grim.js（思路）</td><td className="px-2 py-1">纯 CSS 动画（等价）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">调用</td><td className="px-2 py-1">onMounted new Grim</td><td className="px-2 py-1">@keyframes + background-position</td></tr>
            <tr className="border-b"><td className="px-2 py-1">组合</td><td className="px-2 py-1">AOS+Granim 同思路</td><td className="px-2 py-1">同左</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：流动渐变背景是「氛围感」低成本利器；若想用真库，Granim（画布渐变）也是同思路选择。与 AOS 组合（AOS 管入场、渐变管背景）是轻量落地页提质套路。</p>
      </details>
    </main>
  )
}

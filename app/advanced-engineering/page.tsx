// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（工程篇）· 单元测试（Vitest + RTL）
// · Vue2/Vue3 对照：Vue 测试用 Vitest + @vue/test-utils（或 @testing-library/vue），思路完全一致；
// · React 对照：Vitest + @testing-library/react（RTL）写组件用例，本例 Counter 组件 + 用例骨架。
// 📌 实战定位：单测【了解即可·进阶】；业务组件建议补用例，框架层已把工具链搭好。
// 🧭 学习模式：🔧固定写法=render + screen + fireEvent/expect；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import Counter from './Counter'

/**
 * 工程化 · 单元测试（Vitest + RTL）（搬运自 ReactAdm03）
 * 重点练：组件 + 用例（见 Counter.tsx / Counter.test.tsx）。
 */
export default function EngineeringPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>工程化 · 单元测试（Vitest + RTL）</h1>
      <p>练习前先装测试依赖：</p>
      <pre>pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom</pre>
      <p>
        组件见 <code>Counter.tsx</code>，用例骨架见 <code>Counter.test.tsx</code>（👉 填用例）。
      </p>
      <Counter initial={0} />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">测试栈</td><td className="px-2 py-1">Vitest + vue-test-utils</td><td className="px-2 py-1">Vitest + RTL（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">渲染组件</td><td className="px-2 py-1">@vue/test-utils mount</td><td className="px-2 py-1">render(...)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">查询/触发</td><td className="px-2 py-1">wrapper.find / trigger</td><td className="px-2 py-1">screen / fireEvent</td></tr>
            <tr className="border-b"><td className="px-2 py-1">断言</td><td className="px-2 py-1">expect</td><td className="px-2 py-1">expect</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：单测栈 React/Vue 都用 Vitest；RTL 与 vue-test-utils 思路一致。</p>
      </details>

    </main>
  )
}

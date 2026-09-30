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
    </main>
  )
}

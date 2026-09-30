'use client'

import { useState } from 'react'

/**
 * 被测组件：简单计数器。
 * 练习前先装测试依赖：
 *   pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
 */
export default function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>加一</button>
    </div>
  )
}

// 单元测试骨架（Vitest + React Testing Library）
// 练习前先装：pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
// 并在 vitest.config / vite.config 里配置 test.environment='jsdom'、setupFiles 引入 jest-dom
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter'

// 👉 手敲：补充测试用例（渲染、点击加一、边界）
describe('Counter', () => {
  it('渲染初始值', () => {
    // 👉 render(<Counter initial={0} />)
    // 👉 expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('点击加一', () => {
    // 👉 render(<Counter initial={0} />)
    // 👉 fireEvent.click(screen.getByText('加一'))
    // 👉 expect(screen.getByTestId('count').textContent).toBe('1')
  })
})

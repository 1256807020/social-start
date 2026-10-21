// 单元测试（Vitest + React Testing Library）—— 练习点已填，跑通即懂。
// 工具链已就绪：pnpm 装了 @testing-library/react + jest-dom + jsdom，
// 并在 vitest.component.config.ts 里配好 jsdom 环境 + setupFiles（引入 jest-dom 匹配器）。
// 运行：pnpm test:component
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter'

// 👉 手敲的测试用例（渲染、点击加一、自定义初始值 + 边界）
describe('Counter', () => {
  it('渲染初始值', () => {
    render(<Counter initial={0} />)
    // toHaveTextContent 来自 jest-dom（证明 setupFiles 生效）
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('点击加一', () => {
    render(<Counter initial={0} />)
    fireEvent.click(screen.getByText('加一'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('支持自定义初始值并继续累加', () => {
    render(<Counter initial={5} />)
    expect(screen.getByTestId('count')).toHaveTextContent('5')
    fireEvent.click(screen.getByText('加一'))
    expect(screen.getByTestId('count')).toHaveTextContent('6')
  })
})

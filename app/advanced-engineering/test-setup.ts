// 组件测试全局 setup：引入 jest-dom 匹配器（toHaveTextContent / toBeInTheDocument 等）。
// 仅组件测试用，由 vitest.component.config.ts 的 setupFiles 加载。
import '@testing-library/jest-dom'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 组件单元测试专用配置：与根 vitest.config.ts（接口集成测试，node 环境、跑 tests/**）隔离，互不干扰。
// - jsdom：提供 DOM 环境（React Testing Library 需要）
// - include：只跑 app 下的 *.test.tsx（组件用例）
// - setupFiles：引入 jest-dom 的匹配器（toHaveTextContent 等）
// 用 .mts 扩展名避免「ESM 语法被当 CJS 加载」的弃用警告。
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./app/advanced-engineering/test-setup.ts'],
    include: ['app/**/*.test.tsx'],
    css: false,
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./vitest.global-setup.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 180000,
    // 全局只起一个 Next 服务，所有用例共用，避免并发起多服务抢端口
    fileParallelism: false,
  },
})

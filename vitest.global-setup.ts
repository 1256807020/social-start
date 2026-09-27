import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

let server: ChildProcess | null = null

/**
 * 全局启动一个隔离的 Next 服务用于接口测试：
 * - 端口 3210
 * - DATA_DIR=.vitest-data（所有集合 JSON 落到仓库根 .vitest-data/，不污染真实 data/）
 * - 直接调用 node node_modules/next/dist/bin/next，避免依赖 shell 里的 npx（Windows 上 npx 是 .cmd，spawn 找不到）
 * - 测试结束后 SIGTERM 关闭
 */
export async function setup() {
  const port = 3210
  process.env.TEST_BASE = `http://localhost:${port}`
  const env = { ...process.env, DATA_DIR: '.vitest-data', PORT: String(port) }
  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')

  server = spawn(process.execPath, [nextBin, 'dev', '-p', String(port)], {
    cwd: process.cwd(),
    stdio: 'ignore',
    env,
  })

  const base = `http://localhost:${port}`
  const deadline = Date.now() + 180000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/api/health`)
      if (r.ok) {
        // eslint-disable-next-line no-console
        console.log('[vitest:globalSetup] Next dev 就绪 ✓')
        return
      }
    } catch {
      // 服务尚未监听，继续等
    }
    await sleep(1000)
  }
  server.kill('SIGTERM')
  throw new Error('Next dev 服务在 180s 内未就绪')
}

export async function teardown() {
  if (server) {
    server.kill('SIGTERM')
    server = null
  }
}

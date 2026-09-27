import { execFileSync } from 'node:child_process'

const BASE = process.env.TEST_BASE as string

/**
 * 浏览器级全量冒烟：用全局安装的 agent-browser CLI 驱动 Chromium 打开 /basic，
 * 真实走页面 UI 验证：区块渲染、验证码图、树形新增(表单)、刷新树、验证码校验(真实码)、图片上传。
 * 逻辑在 tests/run-browser.sh（与接口测试共用同一个 Next 服务）。
 */
it(
  'agent-browser 浏览器级全量冒烟：渲染/验证码/树形新增/校验/上传',
  () => {
    const shell = process.env.SHELL && process.env.SHELL.includes('bash') ? process.env.SHELL : 'bash'
    const out = execFileSync(shell, ['tests/run-browser.sh'], {
      encoding: 'utf8',
      timeout: 180000,
      env: { ...process.env, TEST_BASE: BASE },
    })
    if (!out.includes('browser-smoke OK')) {
      throw new Error('浏览器冒烟未通过:\n' + out)
    }
  },
  200000,
)

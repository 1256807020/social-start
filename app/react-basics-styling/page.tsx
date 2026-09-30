'use client'

import type { ReactNode } from 'react'
import styles from './Alert.module.css'

/**
 * React 基础 · 样式方案：内联样式 / 全局 CSS / CSS Modules
 * 搬运自 ReactAdm02，改成 TS/Next。
 */

function Alert({ children, type = 'info' }: { children?: ReactNode; type?: string }) {
  // 👉 练习：用模板字符串拼出 `${styles.alert} ${styles[type] ?? ''}`
  // CSS Modules 的类名会被哈希化，做到样式隔离（不会污染全局）
  const cls = `${styles.alert} ${(styles as Record<string, string>)[type ?? 'info'] ?? ''}`
  return <div className={cls}>{children}</div>
}

export default function ReactBasicsStylingPage() {
  const titleStyle = { color: 'blue', fontSize: '24px', textAlign: 'center' as const }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1 style={titleStyle}>React 基础 · 样式方案</h1>

      <section>
        <h2>① 内联样式</h2>
        {/* style 接收对象，属性名用驼峰（fontSize 而非 font-size） */}
        <div style={{ color: 'green' }}>这是内联绿色文字</div>
      </section>

      <section>
        <h2>② CSS Modules（样式隔离）</h2>
        <Alert>success type</Alert>
        <Alert type="error">error wrong</Alert>
      </section>

      <section>
        <h2>③ 全局 CSS</h2>
        {/* 这个类名来自全局样式表（可在 app/globals.css 里加一条 .global-demo 验证） */}
        <p className="global-demo">global-demo：若 globals.css 没定义就无样式，自己加一条试试</p>
      </section>
    </main>
  )
}

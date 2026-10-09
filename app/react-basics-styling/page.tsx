'use client'

import type { ReactNode } from 'react'
import styles from './Alert.module.css'

/**
 * React 基础 · 样式方案：内联样式 / 全局 CSS / CSS Modules / Tailwind
 * 搬运自 ReactAdm02，改成 TS/Next。
 *
 * ── React ↔ Vue2 / Vue3 样式对照（看一眼有个底）──
 *  场景        React 写法                   Vue2 写法                Vue3 写法
 *  内联样式    style={{color:'red'}}        :style="{color:'red'}"   同 Vue2（还支持数组 / 驼峰 / 连字符）
 *  作用域样式  CSS Modules(.module.css)     <style scoped>           <style scoped> / <style module>（暴露 $style）
 *  全局样式    全局 .css + className 字符串  <style>（无 scoped）     同 Vue2
 *  原子化      Tailwind className="..."     同（配 PostCSS）         同（或 UnoCSS）
 *  心智差：React 用 className（字符串），Vue 用 class；React 的 style 是【对象 + 驼峰】，
 *          Vue 的 :style 可接受对象 / 字符串、更宽松（也认 font-size 这种连字符写法）。
 *  详见页面底部 ⑤ 对照速查表。
 */

function Alert({ children, type = 'info' }: { children?: ReactNode; type?: string }) {
  // 👉 练习：用模板字符串拼出 `${styles.alert} ${styles[type] ?? ''}`
  // CSS Modules 的类名会被哈希化，做到样式隔离（不会污染全局）
  // 👉 Vue2/Vue3 对照：SFC 里写 <style scoped> 即作用域隔离；Vue3 还有 <style module> 把类暴露到 $style，等价于这里取 styles.xxx
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
        {/* 👉 Vue2/Vue3 对照：<p :style="{ color: 'green' }"> 或 :style="styleObj"（:style 还能是数组叠加多个对象）；
            React 的 style 必须是对象且驼峰 */}
      </section>

      <section>
        <h2>② CSS Modules（样式隔离）</h2>
        <Alert>success type</Alert>
        <Alert type="error">error wrong</Alert>
        {/* 👉 Vue2/Vue3 对照：SFC 里写 <style scoped> 即自动加 data-v-xxx 作用域隔离；
            Vue3 另有 <style module> 把类挂到 $style，等价于 React 的 CSS Modules 取对象属性 */}
      </section>

      <section>
        <h2>③ 全局 CSS</h2>
        {/* 这个类名来自全局样式表（可在 app/globals.css 里加一条 .global-demo 验证） */}
        <p className="global-demo">global-demo：若 globals.css 没定义就无样式，自己加一条试试</p>
        {/* 👉 Vue2/Vue3 对照：SFC 里写 <style>（不加 scoped）即为全局样式，和 React 引全局 .css + 字符串 className 同理 */}
      </section>

      <section className="!mt-8">
        <h2>④ Tailwind（本项目实际用的原子化方案）</h2>
        <p style={{ fontSize: 14, color: '#666' }}>
          本仓库是 Next + Tailwind v4 + shadcn，样式靠 className 上的 utility 类，通常不用手写 .css。
        </p>
        <div className="rounded border border-blue-300 bg-blue-50 p-3 text-blue-700">
          我是 Tailwind 样式：<code>className="rounded border bg-blue-50 text-blue-700 p-3"</code>
        </div>
        {/* 👉 Vue2/Vue3 对照：Vue 也能用 Tailwind（配 PostCSS，写法一致 <div class="rounded border bg-blue-50 ...">）；
            Vue3 生态另有 UnoCSS 原子化方案；但 Vue 默认更常见的是 <style scoped>，而非 utility 类 */}
      </section>

      <section className="!mt-8">
        <h2>⑤ React ↔ Vue2/Vue3 样式对照速查</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">场景</th>
              <th className="border p-2 text-left">React</th>
              <th className="border p-2 text-left">Vue2</th>
              <th className="border p-2 text-left">Vue3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">内联样式</td>
              <td className="border p-2"><code>{'style={{ color: "red" }}'}</code></td>
              <td className="border p-2"><code>{':style="{ color: \'red\' }"'}</code></td>
              <td className="border p-2">同 Vue2（还支持数组 / 驼峰 / 连字符）</td>
            </tr>
            <tr>
              <td className="border p-2">作用域样式</td>
              <td className="border p-2"><code>*.module.css + styles.x</code></td>
              <td className="border p-2"><code>&lt;style scoped&gt;</code></td>
              <td className="border p-2"><code>&lt;style scoped&gt;</code> / <code>&lt;style module&gt;</code></td>
            </tr>
            <tr>
              <td className="border p-2">全局样式</td>
              <td className="border p-2"><code>全局 .css + className 串</code></td>
              <td className="border p-2"><code>&lt;style&gt;</code>（无 scoped）</td>
              <td className="border p-2">同 Vue2</td>
            </tr>
            <tr>
              <td className="border p-2">原子化</td>
              <td className="border p-2"><code>className="text-red-500"</code></td>
              <td className="border p-2">同（配 PostCSS）</td>
              <td className="border p-2">同（或 UnoCSS）</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 13, color: '#888' }}>
          心智差：React 用 <code>className</code>（字符串），Vue 用 <code>class</code>；React 的 <code>style</code> 是【对象 + 驼峰】，Vue 的 <code>:style</code> 更宽松（对象 / 字符串 / 数组都行）。
        </p>
      </section>
    </main>
  )
}

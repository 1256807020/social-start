'use client'

/**
 * 被 React.lazy 按需加载的“重组件”示例。
 * 👉 练习：把这里换成你自己的重逻辑（大表格 / 图表等）。
 */
export default function Heavy() {
  return (
    <div style={{ padding: 20, border: '1px dashed #999' }}>
      我是被代码分割懒加载的重组件（单独打包，需要时再下载）
    </div>
  )
}

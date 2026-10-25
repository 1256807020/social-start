'use client'

// 【next-convention-files · global-error.tsx（根级兜底）】app/global-error.tsx
// ⚠️ 这是本学习分支为了演示而加的<strong>根级</strong>文件：它是最后一道防线，
//    只在「根 layout / 根 template」本身崩了、且没有上层 error 能兜时才出现。
//    error.tsx 抓不到同级 layout 的错误 —— 那种情况就会冒泡到这里。
// 🔧 固定写法：① 必须 'use client'；② <strong>必须自己渲染 <html> 与 <body></strong>
//    （因为它会替换掉整个根布局，连 html/body 都要它自己输出）。
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ maxWidth: 640, margin: '48px auto', padding: 24 }}>
          <h1 style={{ fontSize: 20, color: '#b91c1c' }}>整站级错误（global-error.tsx）</h1>
          <p style={{ fontSize: 14, color: '#374151' }}>
            根布局崩了才会看到这一页，是最后一道防线。
          </p>
          <pre style={{ fontSize: 12, background: '#f3f4f6', padding: 12, overflowX: 'auto' }}>
            {error.message}
          </pre>
          <button
            style={{
              background: '#b91c1c',
              color: '#fff',
              border: 0,
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
            onClick={() => reset()}
          >
            重试
          </button>
        </main>
      </body>
    </html>
  )
}

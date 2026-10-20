'use client'

import { useEffect, useState } from 'react'

/**
 * 从 Vue 转 React（导入 / 导出 import-export 篇）
 * Vue2 对照：早年要前端读 FileReader + 自己拼 CSV，或后端写个 /export 把 DB 流成文件；
 *            这里基座把「导入 / 导出」做成约定式集合接口——前端只管发请求，不用自己解析文件。
 *
 * 实战定位：🔧 必会 —— 检验基座「集合级导入 / 导出」能力：
 *   · 导入 POST /api/:resource/import —— 既收 JSON 数组，也收上传的 .json / .csv 文件（multipart）
 *   · 导出 GET  /api/:resource/export?format=json|csv —— 直接下载附件
 *
 * 学习模式：🔧 固定写法（import 收 JSON 或文件、export 带 format 参数）、
 *          👉 练习点（理解「CSV 往返」——导出 csv 再导入，注意类型会被扁平化）。
 *
 * 数据文件：本例用 books 集合（data/books.json）。不预建——首次 import 时基座自动建库（约定式）。
 */

type Row = Record<string, unknown>

const BOOKS = 'books'

// 填充示例数据（一次 POST 数组演示「import 收 JSON 数组」）
const SAMPLES = [
  { title: '三体', author: '刘慈欣', year: 2008, price: 39.9 },
  { title: '活着', author: '余华', year: 1993, price: 28 },
  { title: '小王子', author: '圣埃克苏佩里', year: 1943, price: 19.8 },
  { title: '人类简史', author: '尤瓦尔·赫拉利', year: 2011, price: 68 },
]

export default function ImportExportPage() {
  const [books, setBooks] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLES, null, 2)) // 文本框预填示例 JSON
  const [fileName, setFileName] = useState('') // 选中的上传文件名
  // 请求日志：把每一次 fetch 都打出来，直观看到「导入/导出各 1 次请求」
  const [logs, setLogs] = useState<string[]>([])

  const log = (m: string) =>
    setLogs((p) => [`${new Date().toLocaleTimeString()}  ${m}`, ...p].slice(0, 20))

  // 拉列表（GET /api/books）
  const loadBooks = async () => {
    const r = await fetch(`/api/${BOOKS}`, { cache: 'no-store' })
    const j = await r.json()
    if (j.code === 0) setBooks(Array.isArray(j.data) ? j.data : [])
  }

  useEffect(() => {
    loadBooks().catch((e) => setError(e instanceof Error ? e.message : String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ① 填充示例：POST /api/books/import，body 为 JSON 数组（1 次请求灌多条）
  const seed = async () => {
    setLoading(true)
    setError(null)
    try {
      log(`POST /api/${BOOKS}/import  (JSON 数组)  ×1`)
      const r = await fetch(`/api/${BOOKS}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SAMPLES),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '填充失败')
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ② 导入（粘贴的 JSON）：文本框内容直接 POST 给 import 接口（基座负责 JSON.parse + 批量建）
  const importJson = async () => {
    if (!jsonText.trim()) return
    setLoading(true)
    setError(null)
    try {
      JSON.parse(jsonText) // 先在前端校验，给用户即时报错
      log(`POST /api/${BOOKS}/import  (JSON 数组)  ×1`)
      const r = await fetch(`/api/${BOOKS}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonText,
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '导入失败')
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ③ 导入（上传文件）：multipart/form-data，字段名 file（.json 或 .csv 都行）
  //    ⚠️ 基座按文件名后缀判断：.csv → csvToArray 解析；.json → JSON.parse。也能用 ?format=csv 强制。
  const importFile = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const isCsv = file.name.toLowerCase().endsWith('.csv')
      log(`POST /api/${BOOKS}/import  (multipart 文件 ${file.name})  ×1`)
      const r = await fetch(`/api/${BOOKS}/import`, { method: 'POST', body: fd })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '文件导入失败')
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ④ 导出下载：fetch 拿 blob，前端用 <a download> 触发下载（不走 window.open，避免弹窗被拦）
  //    format=json | csv；响应头 Content-Disposition: attachment 会让浏览器存盘。
  const download = async (format: 'json' | 'csv') => {
    setLoading(true)
    setError(null)
    try {
      log(`GET /api/${BOOKS}/export?format=${format}  ×1`)
      const r = await fetch(`/api/${BOOKS}/export?format=${format}`, { cache: 'no-store' })
      if (!r.ok) throw new Error(`导出失败 ${r.status}`)
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${BOOKS}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const renderCell = (v: unknown) =>
    v == null ? <span className="ie-null">（空）</span> : String(v)

  return (
    <main className="ie-wrap">
      <style>{css}</style>
      {loading && <div className="ie-loading-bar" aria-hidden />}
      <h1>📥📤 导入 / 导出 · Import / Export Demo</h1>
      <p className="ie-sub">
        检验基座「集合级导入 / 导出」能力：<strong>导入</strong> 用 <code>POST /api/:resource/import</code>，
        既收 <strong>JSON 数组</strong>，也收上传的 <strong>.json / .csv 文件</strong>（multipart）；
        <strong>导出</strong> 用 <code>GET /api/:resource/export?format=json|csv</code> 直接下载。
        所有请求走 <code>/api/*</code>，前端不自己解析 CSV。
      </p>

      <div className="ie-bar">
        <button className="ie-primary" onClick={seed}>
          填充示例数据
        </button>
        <button className="ie-ghost" onClick={() => download('json')}>
          导出 JSON
        </button>
        <button className="ie-ghost" onClick={() => download('csv')}>
          导出 CSV
        </button>
        <span className="ie-hint">导出后把文件再「上传导入」，体验 CSV 往返</span>
      </div>

      <div className="ie-grid">
        <div className="ie-left">
          {/* 导入：粘贴 JSON */}
          <div className="ie-card">
            <div className="ie-card-h">① 导入（粘贴 JSON 数组）</div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            <button className="ie-primary" onClick={importJson}>
              导入 JSON
            </button>
          </div>

          {/* 导入：上传文件 */}
          <div className="ie-card">
            <div className="ie-card-h">② 导入（上传 .json / .csv 文件）</div>
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) {
                  setFileName(f.name)
                  importFile(f)
                }
              }}
            />
            {fileName && <div className="ie-file">已选：{fileName}</div>}
          </div>

          {error && <div className="ie-error">出错：{error}</div>}

          <table className={`ie-table${loading ? ' is-loading' : ''}`}>
            <thead>
              <tr>
                <th>id</th>
                <th>书名</th>
                <th>作者</th>
                <th>年份</th>
                <th>价格</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={String(b.id)}>
                  <td>{String(b.id)}</td>
                  <td>{renderCell(b.title)}</td>
                  <td>{renderCell(b.author)}</td>
                  <td>{renderCell(b.year)}</td>
                  <td>{renderCell(b.price)}</td>
                </tr>
              ))}
              {!loading && books.length === 0 && (
                <tr>
                  <td className="ie-empty" colSpan={5}>
                    暂无数据，点「填充示例数据」或上方导入
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 请求日志 */}
        <div className="ie-logs">
          <div className="ie-logs-h">📡 请求日志（每次导入/导出都 1 次请求）</div>
          {logs.length === 0 ? (
            <div className="ie-logs-empty">操作后会显示每一次请求…</div>
          ) : (
            <ul>
              {logs.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="ie-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心（导入）</b>：<code>POST /api/&lt;resource&gt;/import</code> 的 body 可以是「JSON 数组」（直接批量建），
            也可以是 <code>multipart/form-data</code> 上传的文件（字段名 <code>file</code>）。基座自动判断：
            <code>.json</code> → <code>JSON.parse</code>，<code>.csv</code> → <code>csvToArray</code>（见
            <code>app/api/[resource]/import/route.ts</code>）。前端<strong>完全不用自己解析 CSV</strong>。
          </li>
          <li>
            <b>核心（导出）</b>：<code>GET /api/&lt;resource&gt;/export?format=json|csv</code> 返回附件
            （<code>Content-Disposition: attachment</code>）。json 直接 <code>JSON.stringify</code>，
            csv 经 <code>arrayToCsv</code> 把记录数组拼成表格文本。
          </li>
          <li>
            <b>CSV 往返的坑（练习点）</b>：导出 csv 再导入，<code>csvToArray</code> 只把 <code>id</code> 列数值化，
            其余字段保持<strong>字符串</strong>（如 <code>year</code>、<code>price</code> 会变成 <code>"2008"</code>、
            <code>"39.9"</code>）。这是 CSV 的固有扁平化——想保类型就用 JSON 往返。页面表格把这些都原样显示出来，方便你观察。
          </li>
          <li>
            <b>外壳（UI）</b>：文本框粘贴 JSON、文件选择上传、导出下载按钮、列表展示、请求日志面板。换成任意框架，核心不变。
          </li>
          <li>
            <b>真实接口请求</b>：导入 / 导出全走 <code>/api/*</code>，绝不直接读 <code>data/*.json</code>；
            <code>books.json</code> 不预建，首次 import 时基座自动建库（约定式 CRUD）。
          </li>
        </ul>
        <table className="ie-compare">
          <thead>
            <tr>
              <th>维度</th>
              <th>Vue2 / 传统后端</th>
              <th>React（本例）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>导入</td>
              <td>前端 FileReader 读文件 + 自己拼解析，或后端写解析接口</td>
              <td>POST import，JSON 数组或文件，基座解析</td>
            </tr>
            <tr>
              <td>导出</td>
              <td>后端流化文件 / 前端手动拼 CSV</td>
              <td>GET export?format=，直接下载</td>
            </tr>
            <tr>
              <td>CSV 解析</td>
              <td>自己处理引号/逗号转义</td>
              <td>基座 lib/csv.ts 处理（含 "" 转义、CRLF）</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  )
}

const css = `
.ie-wrap { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.ie-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.ie-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.ie-sub code, .ie-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.ie-loading-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
  background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent);
  animation: ie-loadbar .9s linear infinite; }
@keyframes ie-loadbar { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.ie-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 14px; }
.ie-hint { color: #6b7280; font-size: 13px; }
.ie-ghost { padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
.ie-ghost:disabled { opacity: .4; cursor: not-allowed; }
.ie-primary { padding: 6px 14px; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }
.ie-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
@media (max-width: 760px) { .ie-grid { grid-template-columns: 1fr; } }
.ie-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; }
.ie-card-h { font-weight: 600; margin-bottom: 8px; font-size: 14px; }
.ie-card textarea { width: 100%; min-height: 120px; font-family: ui-monospace, monospace; font-size: 12px; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px; resize: vertical; margin-bottom: 8px; }
.ie-file { color: #6b7280; font-size: 13px; margin-top: 6px; }
.ie-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.ie-table { width: 100%; border-collapse: collapse; font-size: 14px; transition: opacity .18s ease; }
.ie-table.is-loading { opacity: .5; }
.ie-table th { background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.ie-table td { border: 1px solid #e5e7eb; padding: 8px 10px; vertical-align: top; }
.ie-table tr:nth-child(even) { background: #fafafa; }
.ie-null { color: #9ca3af; }
.ie-empty { text-align: center; color: #9ca3af; padding: 16px; }
.ie-logs { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 12px; max-height: 360px; overflow: auto; }
.ie-logs-h { font-family: system-ui, sans-serif; font-weight: 600; color: #93c5fd; margin-bottom: 8px; }
.ie-logs-empty { color: #64748b; }
.ie-logs ul { list-style: none; margin: 0; padding: 0; line-height: 1.7; }
.ie-logs li { border-bottom: 1px solid #1e293b; padding: 2px 0; }
.ie-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.ie-details summary { cursor: pointer; font-weight: 600; }
.ie-details ul { line-height: 1.7; padding-left: 20px; }
.ie-compare { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
.ie-compare th, .ie-compare td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
.ie-compare th { background: #eef2ff; }
`

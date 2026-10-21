'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
 *
 * 样式：已改为 Tailwind 工具类 + shadcn 组件（Button/Textarea），设计令牌驱动、暗色自适应；
 *       原 <style>{css}</style> 字符串写法已移除（全局污染 / 硬编码 hex / 暗色失效）。
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
    v == null ? <span className="text-muted-foreground">（空）</span> : String(v)

  return (
    <main className="mx-auto max-w-[1000px] p-6">
      {loading && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
      <h1 className="text-2xl font-semibold">📥📤 导入 / 导出 · Import / Export Demo</h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        检验基座「集合级导入 / 导出」能力：<strong>导入</strong> 用{' '}
        <code className="cf-code">POST /api/:resource/import</code>，既收 <strong>JSON 数组</strong>，也收上传的{' '}
        <strong>.json / .csv 文件</strong>（multipart）；<strong>导出</strong> 用{' '}
        <code className="cf-code">GET /api/:resource/export?format=json|csv</code> 直接下载。 所有请求走{' '}
        <code className="cf-code">/api/*</code>，前端不自己解析 CSV。
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button onClick={seed}>填充示例数据</Button>
        <Button variant="outline" onClick={() => download('json')}>
          导出 JSON
        </Button>
        <Button variant="outline" onClick={() => download('csv')}>
          导出 CSV
        </Button>
        <span className="text-sm text-muted-foreground">导出后把文件再「上传导入」，体验 CSV 往返</span>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-[1fr_320px]">
        <div>
          {/* 导入：粘贴 JSON */}
          <div className="mb-3 rounded-xl border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">① 导入（粘贴 JSON 数组）</div>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
              className="mb-2 min-h-[120px] font-mono text-xs"
            />
            <Button onClick={importJson}>导入 JSON</Button>
          </div>

          {/* 导入：上传文件 */}
          <div className="mb-3 rounded-xl border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">② 导入（上传 .json / .csv 文件）</div>
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
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileName && <div className="mt-1.5 text-sm text-muted-foreground">已选：{fileName}</div>}
          </div>

          {error && (
            <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              出错：{error}
            </div>
          )}

          <table className={`w-full border-collapse text-sm transition-opacity ${loading ? 'opacity-50' : ''}`}>
            <thead>
              <tr>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">id</th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">书名</th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">作者</th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">年份</th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">价格</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={String(b.id)} className="even:bg-muted/50">
                  <td className="border border-border px-2.5 py-2 align-top">{String(b.id)}</td>
                  <td className="border border-border px-2.5 py-2 align-top">{renderCell(b.title)}</td>
                  <td className="border border-border px-2.5 py-2 align-top">{renderCell(b.author)}</td>
                  <td className="border border-border px-2.5 py-2 align-top">{renderCell(b.year)}</td>
                  <td className="border border-border px-2.5 py-2 align-top">{renderCell(b.price)}</td>
                </tr>
              ))}
              {!loading && books.length === 0 && (
                <tr>
                  <td className="border border-border px-2.5 py-4 text-center text-muted-foreground" colSpan={5}>
                    暂无数据，点「填充示例数据」或上方导入
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 请求日志 */}
        <div className="max-h-[360px] overflow-auto rounded-xl border bg-slate-900 p-3 font-mono text-xs text-slate-200">
          <div className="mb-2 font-sans font-semibold text-sky-300">
            📡 请求日志（每次导入/导出都 1 次请求）
          </div>
          {logs.length === 0 ? (
            <div className="text-slate-400">操作后会显示每一次请求…</div>
          ) : (
            <ul className="space-y-0.5">
              {logs.map((l, i) => (
                <li key={i} className="border-b border-slate-800 py-0.5">
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="cf-prose">
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
        <table>
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

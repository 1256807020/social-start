'use client'

import { useEffect, useState } from 'react'

/**
 * 从 Vue 转 React（文件上传 upload 篇）
 * Vue2 对照：早年上传用 <input type=file> + new FormData + axios.post，自己读 FileReader 转 base64 或处理进度；
 *            这里基座提供两条现成路由 /api/image/upload（图片）与 /api/file/upload（通用文件），
 *            前端只管 `FormData.append('file', f)` 再 POST，返回 `url` 直接 <img src> / <a href> 即可，不用自己处理。
 *
 * 实战定位：🔧 必会 —— 文件 / 图片上传是极常见需求，基座把「存盘 + 拼可访问 url」都包了。
 *
 * 学习模式：🔧 固定写法（<input type=file> + FormData + POST 上传；多文件 append 多次；返回 url 直接用）、
 *          👉 练习点（图片路由 vs 通用文件路由的 url 前缀差异 /img 与 /uploads；占位图 placeholder 免真传）。
 *
 * 数据：图片走基座 image 模块（/api/image/*，存 data/uploads，url 前缀 /img）；
 *       通用文件走 file 模块（/api/file/*，存 public/uploads，url 前缀 /uploads）。均为基座内置，非自建 <resource>。
 */

type UploadedItem = {
  name: string
  original?: string
  url?: string
  size?: number
  sizeText?: string
  ext?: string
}

const API = {
  imgUpload: '/api/image/upload',
  imgList: '/api/image/list',
  imgDel: (n: string) => `/api/image/${encodeURIComponent(n)}`,
  fileUpload: '/api/file/upload',
  fileList: '/api/file/list',
  fileDel: (n: string) => `/api/file/${encodeURIComponent(n)}`,
  placeholder: (size: string, text: string) =>
    `/api/image/placeholder/${size}?text=${encodeURIComponent(text)}`,
}

// 列表项只有 name 也够用：按模块拼出可访问 url（与上传返回的 url 一致）
const imgUrl = (it: UploadedItem) => it.url || `/img/${encodeURIComponent(it.name)}`
const fileUrl = (it: UploadedItem) => it.url || `/uploads/${encodeURIComponent(it.name)}`

export default function UploadDemoPage() {
  const [images, setImages] = useState<UploadedItem[]>([])
  const [files, setFiles] = useState<UploadedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 请求日志：把每一次 fetch 打出来，直观看到「上传 = 1 次 POST，多文件也是 1 次并集」
  const [logs, setLogs] = useState<string[]>([])
  // 占位图生成器
  const [phSize, setPhSize] = useState('300x200')
  const [phText, setPhText] = useState('占位图')

  const log = (m: string) =>
    setLogs((p) => [`${new Date().toLocaleTimeString()}  ${m}`, ...p].slice(0, 20))

  // 列表（GET /api/image/list、/api/file/list）—— 纯 GET，带分页信封
  const loadImages = async () => {
    const r = await fetch(API.imgList, { cache: 'no-store' })
    const j = await r.json()
    if (j.code === 0) setImages(Array.isArray(j.data) ? j.data : [])
  }
  const loadFiles = async () => {
    const r = await fetch(API.fileList, { cache: 'no-store' })
    const j = await r.json()
    if (j.code === 0) setFiles(Array.isArray(j.data) ? j.data : [])
  }

  useEffect(() => {
    Promise.all([loadImages(), loadFiles()]).catch((e) =>
      setError(e instanceof Error ? e.message : String(e)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 核心写法：上传 = FormData + POST ──
  // 单/多文件都 append 到同一个字段名 'file'，基座用 form.getAll('file') 一次性收下（多文件 = 1 次请求）
  const upload = async (endpoint: string, list: FileList, kind: '图片' | '文件') => {
    if (!list.length) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      for (const f of Array.from(list)) fd.append('file', f)
      log(`POST ${endpoint}  ${kind} ×${list.length}  ×1（FormData）`)
      const r = await fetch(endpoint, { method: 'POST', body: fd })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '上传失败')
      const saved: UploadedItem[] = Array.isArray(j.data) ? j.data : [j.data]
      if (kind === '图片') setImages((p) => [...saved, ...p])
      else setFiles((p) => [...saved, ...p])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ── 删除：DELETE /api/image/:name 或 /api/file/:name ──
  const del = async (name: string, kind: '图片' | '文件') => {
    setLoading(true)
    setError(null)
    try {
      const url = kind === '图片' ? API.imgDel(name) : API.fileDel(name)
      log(`DELETE ${url}  ×1`)
      const r = await fetch(url, { method: 'DELETE' })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '删除失败')
      if (kind === '图片') setImages((p) => p.filter((it) => it.name !== name))
      else setFiles((p) => p.filter((it) => it.name !== name))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const phUrl = API.placeholder(phSize, phText)

  return (
    <main className="ud-wrap">
      <style>{css}</style>
      {loading && <div className="ud-loading-bar" aria-hidden />}
      <h1>📤 文件 / 图片上传 · Upload Demo</h1>
      <p className="ud-sub">
        检验基座「文件 / 图片上传」能力：选文件 → <code>FormData.append('file', f)</code> →
        <code>POST /api/image/upload</code>（图片）或 <code>/api/file/upload</code>（通用文件），
        返回 <code>url</code> 直接 <code>&lt;img src&gt;</code> / <code>&lt;a href&gt;</code> 即可，前端不用自己读 FileReader。
        右侧「请求日志」看上传 = 1 次 POST（多文件也是 1 次并集）。
      </p>

      <div className="ud-grid">
        <div className="ud-left">
          {/* 图片上传 */}
          <div className="ud-card">
            <div className="ud-card-h">🖼️ 图片上传（POST /api/image/upload）</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) upload(API.imgUpload, e.target.files, '图片')
                e.currentTarget.value = '' // 允许重复选同一文件
              }}
            />
            <div className="ud-hint">多选 = 1 次请求上传多张；返回 url 前缀 <code>/img</code></div>
            <div className="ud-thumbs">
              {images.map((it) => (
                <div className="ud-thumb" key={it.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl(it)} alt={it.original || it.name} />
                  <div className="ud-thumb-bar">
                    <span title={it.original || it.name}>{it.original || it.name}</span>
                    <button className="ud-del" onClick={() => del(it.name, '图片')}>
                      删
                    </button>
                  </div>
                </div>
              ))}
              {!images.length && <div className="ud-empty">还没有图片，选几张上传试试</div>}
            </div>
          </div>

          {/* 通用文件上传 */}
          <div className="ud-card">
            <div className="ud-card-h">📎 通用文件上传（POST /api/file/upload）</div>
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) upload(API.fileUpload, e.target.files, '文件')
                e.currentTarget.value = ''
              }}
            />
            <div className="ud-hint">任意格式；返回 url 前缀 <code>/uploads</code></div>
            <ul className="ud-filelist">
              {files.map((it) => (
                <li key={it.name}>
                  <a href={fileUrl(it)} target="_blank" rel="noreferrer">
                    {it.original || it.name}
                  </a>
                  <span className="ud-meta">{it.sizeText || ''}</span>
                  <button className="ud-del" onClick={() => del(it.name, '文件')}>
                    删
                  </button>
                </li>
              ))}
              {!files.length && <li className="ud-empty">还没有文件，选一个上传试试</li>}
            </ul>
          </div>

          {/* 占位图生成器 */}
          <div className="ud-card">
            <div className="ud-card-h">🎨 占位图（免真传：GET /api/image/placeholder/:size）</div>
            <div className="ud-row">
              <label>
                尺寸
                <input value={phSize} onChange={(e) => setPhSize(e.target.value)} placeholder="300x200" />
              </label>
              <label>
                文字
                <input value={phText} onChange={(e) => setPhText(e.target.value)} placeholder="占位图" />
              </label>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ud-ph" src={phUrl} alt="占位图预览" />
            <div className="ud-ph-url">{phUrl}</div>
          </div>
        </div>

        {/* 请求日志 */}
        <div className="ud-logs">
          <div className="ud-logs-h">📡 请求日志（上传 = 1 次 POST）</div>
          {logs.length === 0 ? (
            <div className="ud-logs-empty">操作后会显示每一次请求…</div>
          ) : (
            <ul>
              {logs.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <div className="ud-error">出错：{error}</div>}

      <details className="ud-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心（上传）</b>：<code>{'<input type="file">'}</code> 拿到 <code>FileList</code> →
            <code>const fd = new FormData(); fd.append('file', f)</code>（多文件就 append 多次）→
            <code>fetch(endpoint, {'{ method:"POST", body: fd }'})</code>。
            <strong>不要手动设 Content-Type</strong>（浏览器发 multipart 时会自动带 boundary）。
            基座返回 <code>url</code>，图片直接 <code>&lt;img src={url}&gt;</code>、文件直接 <code>&lt;a href={url}&gt;</code>。
          </li>
          <li>
            <b>图片 vs 通用文件</b>：两条独立路由，存盘位置与 url 前缀不同——
            图片 <code>/api/image/upload</code> → 存 <code>data/uploads</code>，url 前缀 <code>/img</code>；
            文件 <code>/api/file/upload</code> → 存 <code>public/uploads</code>，url 前缀 <code>/uploads</code>。
            删都是 <code>DELETE /api/image/:name</code> / <code>/api/file/:name</code>。
          </li>
          <li>
            <b>多文件 = 1 次请求</b>：把所有 File 都 append 到同一个 <code>file</code> 字段，基座 <code>form.getAll('file')</code>
            一次性收下，日志只出现 <code>POST ×1</code>——不必循环发 N 次（这是和「逐条 [id]」不同的地方：上传本就能批量）。
          </li>
          <li>
            <b>占位图（练习点）</b>：不想真传图做布局时，用 <code>GET /api/image/placeholder/:size?text=</code>
            （如 <code>/api/image/placeholder/300x200?text=hi</code>）生成 SVG 占位，前端直接当图片 src。
          </li>
          <li>
            <b>外壳（UI）</b>：文件选择 + 缩略图网格 + 文件列表 + 删除 + 占位图生成器 + 请求日志。换成任意框架，核心不变。
          </li>
          <li>
            <b>真实接口请求</b>：全部走 <code>/api/*</code>；若部署时启用了 <code>ADMIN_TOKEN</code>，写操作（上传/删除）需带 token
            （本项目教学态默认不启，直接可用）。绝不直读 <code>data/uploads</code> / <code>public/uploads</code> 目录。
          </li>
        </ul>
        <table className="ud-compare">
          <thead>
            <tr>
              <th>维度</th>
              <th>Vue2 / 传统</th>
              <th>React（本例）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>上传</td>
              <td>axios + FormData，常自己 FileReader 转 base64</td>
              <td>fetch + FormData，返回 url 直接用</td>
            </tr>
            <tr>
              <td>多文件</td>
              <td>循环 append + 循环请求</td>
              <td>同字段 append 多次，1 次请求</td>
            </tr>
            <tr>
              <td>预览</td>
              <td>URL.createObjectURL 本地预览</td>
              <td>同上；或上传后直接用返回 url</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  )
}

const css = `
.ud-wrap { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.ud-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.ud-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.ud-sub code, .ud-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.ud-loading-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
  background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent);
  animation: ud-loadbar .9s linear infinite; }
@keyframes ud-loadbar { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.ud-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
@media (max-width: 760px) { .ud-grid { grid-template-columns: 1fr; } }
.ud-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; }
.ud-card-h { font-weight: 600; margin-bottom: 8px; font-size: 14px; }
.ud-hint { color: #6b7280; font-size: 13px; margin: 6px 0; }
.ud-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
.ud-row label { display: flex; flex-direction: column; font-size: 12px; color: #6b7280; gap: 4px; }
.ud-row input { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; }
.ud-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-top: 8px; }
.ud-thumb { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; }
.ud-thumb img { width: 100%; height: 90px; object-fit: cover; display: block; }
.ud-thumb-bar { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 4px 6px; font-size: 12px; }
.ud-thumb-bar span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ud-filelist { list-style: none; margin: 8px 0 0; padding: 0; }
.ud-filelist li { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #eef2f7; font-size: 14px; }
.ud-filelist a { color: #2563eb; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.ud-filelist a:hover { text-decoration: underline; }
.ud-meta { color: #9ca3af; font-size: 12px; }
.ud-del { border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; border-radius: 6px; padding: 2px 8px; cursor: pointer; font-size: 12px; }
.ud-empty { color: #9ca3af; font-size: 13px; padding: 8px 0; }
.ud-ph { max-width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 8px; }
.ud-ph-url { font-family: ui-monospace, monospace; font-size: 12px; color: #6b7280; word-break: break-all; margin-top: 6px; }
.ud-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.ud-logs { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 12px; max-height: 520px; overflow: auto; }
.ud-logs-h { font-family: system-ui, sans-serif; font-weight: 600; color: #93c5fd; margin-bottom: 8px; }
.ud-logs-empty { color: #64748b; }
.ud-logs ul { list-style: none; margin: 0; padding: 0; line-height: 1.7; }
.ud-logs li { border-bottom: 1px solid #1e293b; padding: 2px 0; }
.ud-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.ud-details summary { cursor: pointer; font-weight: 600; }
.ud-details ul { line-height: 1.7; padding-left: 20px; }
.ud-compare { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
.ud-compare th, .ud-compare td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
.ud-compare th { background: #eef2ff; }
`

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
 * 数据：图片走基座 image 模块（/api/image/*，存 data/uploads，url 前缀 /img，仅接受图片格式，应用层托管）；
 *       通用文件走 file 模块（/api/file/*，存 public/uploads，url 前缀 /uploads，不限格式，Next 静态直出）。
 *       一句话记：图片 = 内部托管（受控 / 可随库换存储后端）、文件 = 对外公开（直链 / 任意格式）。均为基座内置，非自建 <resource>。
 *
 * 样式：已改为 Tailwind 工具类 + shadcn 组件（Button/Input），设计令牌驱动、暗色自适应；
 *       原 <style>{css}</style> 字符串写法已移除（全局污染 / 硬编码 hex / 暗色失效）。
 */

type UploadedItem = {
  name: string
  original?: string
  url?: string
  size?: number
  sizeText?: string
  ext?: string
}

// 两条上传路由怎么选（详情见页面底部「图片 vs 通用文件」说明）：
//  - img* ：图片专用，落 data/uploads，url 前缀 /img，仅接受图片格式（jpg/png/gif/webp/svg/bmp/ico/avif），受应用层托管
//  - file*：通用文件，落 public/uploads，url 前缀 /uploads，不限格式，由 Next 公开目录静态直出（对外公开）
//  删除各自 DELETE /api/image/:name、DELETE /api/file/:name；列表各自 GET /api/image/list、GET /api/file/list
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

  const fileInputClass =
    'block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground hover:file:bg-primary/90'

  return (
    <main className="mx-auto max-w-[1000px] p-6">
      {loading && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
      <h1 className="text-2xl font-semibold">📤 文件 / 图片上传 · Upload Demo</h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        检验基座「文件 / 图片上传」能力：选文件 → <code className="cf-code">FormData.append('file', f)</code> →
        <code className="cf-code">POST /api/image/upload</code>（图片）或{' '}
        <code className="cf-code">/api/file/upload</code>（通用文件）， 返回{' '}
        <code className="cf-code">url</code> 直接{' '}
        <code className="cf-code">{'<img src>'}</code> / <code className="cf-code">{'<a href>'}</code> 即可，前端不用自己读
        FileReader。 右侧「请求日志」看上传 = 1 次 POST（多文件也是 1 次并集）。
      </p>

      <div className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-[1fr_320px]">
        <div>
          {/* 图片上传 */}
          <div className="mb-3 rounded-xl border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">🖼️ 图片上传（POST /api/image/upload）</div>
            <input
              type="file"
              accept="image/*"
              multiple
              className={fileInputClass}
              onChange={(e) => {
                if (e.target.files) upload(API.imgUpload, e.target.files, '图片')
                e.currentTarget.value = '' // 允许重复选同一文件
              }}
            />
            <div className="my-1.5 text-sm text-muted-foreground">
              多选 = 1 次请求上传多张；返回 url 前缀 <code className="cf-code">/img</code>
            </div>
            <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
              {images.map((it) => (
                <div className="overflow-hidden rounded-lg border bg-background" key={it.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl(it)} alt={it.original || it.name} className="block h-[90px] w-full object-cover" />
                  <div className="flex items-center justify-between gap-1.5 p-1.5 text-xs">
                    <span className="truncate" title={it.original || it.name}>
                      {it.original || it.name}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 px-2 py-0 text-xs"
                      onClick={() => del(it.name, '图片')}
                    >
                      删
                    </Button>
                  </div>
                </div>
              ))}
              {!images.length && (
                <div className="text-sm text-muted-foreground">还没有图片，选几张上传试试</div>
              )}
            </div>
          </div>

          {/* 通用文件上传 */}
          <div className="mb-3 rounded-xl border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">📎 通用文件上传（POST /api/file/upload）</div>
            <input
              type="file"
              multiple
              className={fileInputClass}
              onChange={(e) => {
                if (e.target.files) upload(API.fileUpload, e.target.files, '文件')
                e.currentTarget.value = ''
              }}
            />
            <div className="my-1.5 text-sm text-muted-foreground">
              任意格式；返回 url 前缀 <code className="cf-code">/uploads</code>
            </div>
            <ul className="mt-2 space-y-1.5">
              {files.map((it) => (
                <li key={it.name} className="flex items-center gap-2 border-b border-border py-1.5 text-sm">
                  <a
                    href={fileUrl(it)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate text-primary no-underline hover:underline"
                  >
                    {it.original || it.name}
                  </a>
                  <span className="text-xs text-muted-foreground">{it.sizeText || ''}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 px-2 py-0 text-xs"
                    onClick={() => del(it.name, '文件')}
                  >
                    删
                  </Button>
                </li>
              ))}
              {!files.length && <li className="text-sm text-muted-foreground">还没有文件，选一个上传试试</li>}
            </ul>
          </div>

          {/* 占位图生成器 */}
          <div className="mb-3 rounded-xl border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">🎨 占位图（免真传：GET /api/image/placeholder/:size）</div>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                尺寸
                <Input value={phSize} onChange={(e) => setPhSize(e.target.value)} placeholder="300x200" className="w-28" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                文字
                <Input value={phText} onChange={(e) => setPhText(e.target.value)} placeholder="占位图" className="w-32" />
              </label>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mt-2 max-w-full rounded-lg border" src={phUrl} alt="占位图预览" />
            <div className="mt-1.5 break-all font-mono text-xs text-muted-foreground">{phUrl}</div>
          </div>
        </div>

        {/* 请求日志 */}
        <div className="max-h-[520px] overflow-auto rounded-xl border bg-slate-900 p-3 font-mono text-xs text-slate-200">
          <div className="mb-2 font-sans font-semibold text-sky-300">📡 请求日志（上传 = 1 次 POST）</div>
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

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          出错：{error}
        </div>
      )}

      <details className="cf-prose">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心（上传）</b>：<code>{'<input type="file">'}</code> 拿到 <code>FileList</code> →
            <code>const fd = new FormData(); fd.append('file', f)</code>（多文件就 append 多次）→
            <code>fetch(endpoint, {'{ method:"POST", body: fd }'})</code>。
            <strong>不要手动设 Content-Type</strong>（浏览器发 multipart 时会自动带 boundary）。
            基座返回 <code>url</code>，图片直接 <code>{'<img src={url}>'}</code>、文件直接 <code>{'<a href={url}>'}</code>。
          </li>
          <li>
            <b>图片 vs 通用文件（别选错）</b>：两条独立路由，存盘位置、url 前缀、格式限制都不同——
            <ul>
              <li>
                <b>图片</b> <code>POST /api/image/upload</code> → 存 <code>data/uploads</code>，url{' '}
                <code>/img/&lt;name&gt;</code>。 落在 <code>data/</code>（与 JSON 库同目录，<b>不在 Next 公开目录</b>），必须借应用路由{' '}
                <code>/img/:name</code> 访问，属「<b>应用托管的内部图片存储</b>」；<b>只接受图片格式</b>
                （jpg/png/gif/webp/svg/bmp/ico/avif），传其它格式直接 400。 适合头像 / 配图 / 缩略图等要受应用管控、未来可随库一起换存储后端的图片。
              </li>
              <li>
                <b>通用文件</b> <code>POST /api/file/upload</code> → 存 <code>public/uploads</code>，url{' '}
                <code>/uploads/&lt;name&gt;</code>。 落在 Next 的 <code>public/</code> 公开静态目录，文件以{' '}
                <code>/uploads/&lt;name&gt;</code> <b>直接静态可访问、无应用层</b>，属「<b>对外公开静态资源</b>」；
                <b>不限格式</b>（pdf/doc/zip/视频均收）。适合需直接外链 / 下载的任意文件。
              </li>
            </ul>
            <b>误用提醒</b>：要直接外链下载的文档别走 <code>/api/image</code>（会被格式拦截，且不在 public 无法直链）；
            私密 / 受控图片别走 <code>/api/file</code>（进了 public 就完全公开、无应用层管控）。
            删除都是 <code>DELETE /api/image/:name</code> / <code>/api/file/:name</code>。
          </li>
          <li>
            <b>多文件 = 1 次请求</b>：把所有 File 都 append 到同一个 <code>file</code> 字段，基座{' '}
            <code>form.getAll('file')</code> 一次性收下，日志只出现 <code>POST ×1</code>——不必循环发 N 次（这是和「逐条 [id]」不同的地方：上传本就能批量）。
          </li>
          <li>
            <b>占位图（练习点）</b>：不想真传图做布局时，用{' '}
            <code>GET /api/image/placeholder/:size?text=</code>（如{' '}
            <code>/api/image/placeholder/300x200?text=hi</code>）生成 SVG 占位，前端直接当图片 src。
          </li>
          <li>
            <b>外壳（UI）</b>：文件选择 + 缩略图网格 + 文件列表 + 删除 + 占位图生成器 + 请求日志。换成任意框架，核心不变。
          </li>
          <li>
            <b>真实接口请求</b>：全部走 <code>/api/*</code>；若部署时启用了 <code>ADMIN_TOKEN</code>，写操作（上传/删除）需带 token
            （本项目教学态默认不启，直接可用）。绝不直读 <code>data/uploads</code> / <code>public/uploads</code> 目录。
          </li>
        </ul>
        <table>
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

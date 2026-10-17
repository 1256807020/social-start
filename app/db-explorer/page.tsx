'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * 从 Vue2 转 React（db-explorer 篇）
 * Vue2 对照：当年用 axios 拿后端「接口列表」+ element-ui 表格渲染；这里换成 useEffect + fetch + 原生表格。
 *
 * 实战定位：🔧 必会 —— 这是基座「约定式文件型通用数据接口」的"控制台 / 元数据"页，
 *           一眼看全所有集合（= data/*.json 文件）及其【自动推断】的字段结构，是最能检验基座能力的入口。
 *
 * 学习模式：🔧 固定写法（useEffect+fetch 列表查询 + alive 防竞态 / StrictMode 双调用）、
 *          👉 练习点（点开集合看基座 inferSchema 自动推断的字段类型与示例值）。
 */

// ── 类型小课：联合类型(union) vs 基础类型 ──
// - `string` / `number` 是「基础类型」(单一类型)，不是联合类型。
// - `unknown` 也是单一类型，但它是「最宽泛的顶层类型」：表示"我也不知道具体是什么"。
//   和 `any` 不同，`unknown` 在使用前必须先做类型收窄(typeof / 判断等)才安全。
//   下面 schema 的示例值可能是任意类型，所以字段类型用 `unknown`。
// - `string | null` 才是「联合类型」：用 `|` 把多个类型拼起来，表示"要么是 string，要么是 null"。
//   代码里 `activeName: string | null`、`error: string | null` 都是这个意思。
type CollectionItem = {
  name: string
  count: number
  size: number
  sizeText: string
  updatedAt: string
}

type SchemaField = {
  field: string
  types: string[]
  filled: number
  sample: unknown // unknown：示例值类型不定(字符串/数字/布尔/对象…)，用顶层类型承接，渲染前再 JSON.stringify
}

type CollectionDetail = {
  name: string
  total: number
  file: string
  schema: SchemaField[]
  preview: Record<string, unknown>[] // 每行是个对象，值类型为 unknown(配合上方类型小课)
}

export default function DbExplorerPage() {
  const [list, setList] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // string | null 联合类型：出错时存错误信息，正常时为 null

  const [activeName, setActiveName] = useState<string | null>(null)
  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')

  // 🔧 固定写法：useEffect + fetch 列表查询；alive 防竞态 + 兼容 StrictMode 双调用
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/collections', { cache: 'no-store' })
        const j = await r.json()
        if (!alive) return
        if (j.code !== 0) throw new Error(j.msg || '加载集合列表失败')
        setList(j.data || [])
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // 🔧 useCallback：把函数「记忆化」——依赖数组([])不变时函数引用稳定，不会每次渲染都重建。
  // 好处：①作为 props 传给子组件可避免无谓重渲染；②放进 useEffect 依赖数组时不会因引用变化反复触发。
  const openDetail = useCallback(async (name: string) => {
    setActiveName(name)
    setDetail(null)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const r = await fetch(`/api/collections/${encodeURIComponent(name)}`, { cache: 'no-store' })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '加载集合详情失败')
      setDetail(j.data)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : String(e))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // 同样用 useCallback 包裹删除逻辑（依赖 [activeName]，activeName 变时重建）
  const removeCollection = useCallback(
    async (name: string) => {
      if (!window.confirm(`确定删除集合「${name}」？会删除 data/${name}.json（不可恢复）`)) return
      const r = await fetch(`/api/collections/${encodeURIComponent(name)}`, { method: 'DELETE' })
      const j = await r.json()
      if (j.code !== 0) {
        alert(j.msg || '删除失败')
        return
      }
      if (activeName === name) {
        setActiveName(null)
        setDetail(null)
      }
      const r2 = await fetch('/api/collections', { cache: 'no-store' })
      const j2 = await r2.json()
      if (j2.code === 0) setList(j2.data || [])
    },
    [activeName],
  )

  // 真实接口请求：POST 空数组即触发基座「任意资源名自动建库」，新建 data/<name>.json
  // 同样用 useCallback 包裹新建逻辑（依赖 [newName]，输入框变化时重建）
  const createCollection = useCallback(async () => {
    const name = newName.trim()
    if (!name) return
    const r = await fetch(`/api/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    })
    const j = await r.json()
    if (j.code !== 0) {
      alert(j.msg || '创建失败')
      return
    }
    setNewName('')
    const r2 = await fetch('/api/collections', { cache: 'no-store' })
    const j2 = await r2.json()
    if (j2.code === 0) setList(j2.data || [])
  }, [newName])

  const previewColumns = detail?.schema.map((s) => s.field) ?? []

  return (
    <main className="dbx-wrap">
      <style>{css}</style>
      <h1>🗂 集合管理器 · DB Explorer</h1>
      <p className="dbx-sub">
        这是基座「约定式文件型通用数据接口」的元数据控制台。
        <b>每个集合 = 一个 data/*.json 文件 = 一套完整 CRUD 接口</b>。
        下方列出全部集合，点开可看基座<strong>自动推断</strong>的字段结构与前 5 条预览。
      </p>

      <div className="dbx-toolbar">
        <button onClick={() => window.location.reload()}>🔄 刷新</button>
        <span className="dbx-hint">共 {list.length} 个集合</span>
      </div>

      {error && <div className="dbx-error">加载失败：{error}</div>}
      {loading && <div className="dbx-loading">加载中…</div>}

      {!loading && !error && (
        <table className="dbx-table">
          <thead>
            <tr>
              <th>集合名（= data/&lt;name&gt;.json）</th>
              <th>记录数</th>
              <th>体积</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="dbx-empty">
                  暂无集合，用下方表单新建一个试试 👇
                </td>
              </tr>
            )}
            {list.map((c) => (
              <tr key={c.name} className={activeName === c.name ? 'dbx-active' : ''}>
                <td>
                  <button className="dbx-link" onClick={() => openDetail(c.name)}>
                    {c.name}
                  </button>
                </td>
                <td>{c.count}</td>
                <td>{c.sizeText}</td>
                <td>{c.updatedAt}</td>
                <td>
                  <button className="dbx-btn" onClick={() => openDetail(c.name)}>
                    查看
                  </button>
                  <button className="dbx-btn dbx-danger" onClick={() => removeCollection(c.name)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="dbx-create">
        <input
          placeholder="新集合名（字母/数字/_/-）"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={createCollection}>➕ 新建空集合（POST 触发自动建库）</button>
      </div>

      {detailLoading && <div className="dbx-loading">加载集合详情…</div>}
      {detailError && <div className="dbx-error">详情加载失败：{detailError}</div>}

      {detail && (
        <section className="dbx-detail">
          <h2>
            📋 {detail.name} <small>（{detail.total} 条 · {detail.file}）</small>
          </h2>

          <h3>自动推断字段结构（schema）</h3>
          <table className="dbx-table">
            <thead>
              <tr>
                <th>字段</th>
                <th>类型</th>
                <th>非空数</th>
                <th>示例值</th>
              </tr>
            </thead>
            <tbody>
              {detail.schema.length === 0 && (
                <tr>
                  <td colSpan={4} className="dbx-empty">
                    集合为空，暂无字段可推断
                  </td>
                </tr>
              )}
              {detail.schema.map((f) => (
                <tr key={f.field}>
                  <td>{f.field}</td>
                  <td>{f.types.join(' / ') || '—'}</td>
                  <td>{f.filled}</td>
                  <td>
                    <code>{f.sample === undefined ? '—' : JSON.stringify(f.sample)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>前 5 条预览</h3>
          {detail.preview.length === 0 ? (
            <div className="dbx-empty">集合为空（无记录）</div>
          ) : (
            <table className="dbx-table">
              <thead>
                <tr>{previewColumns.map((col) => <th key={col}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {detail.preview.map((row, i) => (
                  <tr key={i}>
                    {previewColumns.map((col) => (
                      <td key={col}>
                        <code>{row[col] === undefined ? '—' : JSON.stringify(row[col])}</code>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <details className="dbx-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心</b>：一个 json 文件 = 一张表 = 一套完整 CRUD 接口（约定式文件型通用数据接口基座）。
            集合即文件，字段无需预定义。
          </li>
          <li>
            <b>外壳</b>：这里只是用 useEffect+fetch 把 <code>/api/collections</code> 和{' '}
            <code>/api/collections/&#123;name&#125;</code> 渲染成"控制台"UI；换成 Vue2 的 axios +
            element-ui 表格、或任意框架，核心不变。
          </li>
          <li>
            <b>对应基座能力⑧</b>：集合管理（列出全部集合 + 自动推断 schema + 删库）。
            点开详情看到的 schema 推断，正是基座 <code>inferSchema</code> 的能力。
          </li>
          <li>
            <b>真实接口请求</b>：列表 / 详情 / 删除 / 新建全部走 <code>/api/*</code>，
            绝不直接读 <code>data/*.json</code>；新建集合用 POST 空数组触发"任意资源名自动建库"。
          </li>
        </ul>
      </details>
    </main>
  )
}

const css = `
.dbx-wrap { max-width: 960px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.dbx-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.dbx-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.dbx-sub b { color: #111827; }
.dbx-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.dbx-hint { color: #9ca3af; font-size: 13px; }
.dbx-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px; }
.dbx-table th, .dbx-table td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.dbx-table th { background: #f9fafb; font-weight: 600; }
.dbx-table tr.dbx-active { background: #eff6ff; }
.dbx-link { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; font-size: 14px; }
.dbx-btn { margin-right: 6px; padding: 4px 10px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; }
.dbx-btn:hover { background: #f3f4f6; }
.dbx-danger { color: #dc2626; border-color: #fecaca; }
.dbx-danger:hover { background: #fef2f2; }
.dbx-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.dbx-loading { color: #6b7280; padding: 12px 0; }
.dbx-empty { color: #9ca3af; text-align: center; padding: 16px; }
.dbx-create { display: flex; gap: 8px; margin: 16px 0; }
.dbx-create input { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; flex: 1; }
.dbx-create button { padding: 8px 14px; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }
.dbx-detail { margin-top: 20px; }
.dbx-detail h2 { font-size: 18px; margin: 16px 0 8px; }
.dbx-detail h3 { font-size: 15px; margin: 16px 0 6px; color: #374151; }
.dbx-detail small { color: #9ca3af; font-weight: 400; }
.dbx-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.dbx-details summary { cursor: pointer; font-weight: 600; }
.dbx-details ul { line-height: 1.7; padding-left: 20px; }
.dbx-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
`

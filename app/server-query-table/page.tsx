'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'

/**
 * 从 Vue 转 React（server 查询表格篇）
 * Vue2 对照：当年后端写死分页/排序 SQL，前端只传 page；这里前端直接拼基座查询语法（分页/排序/搜索/操作符/投影），后端即基座。
 *
 * 实战定位：🔧 必会 —— 检验基座「约定式文件型通用数据接口」的查询能力：
 *           分页(page/pageSize) / 排序(sort/-字段) / 关键字(keyword) / 字段操作符(done_in / id_gte / title_like) / 投影(fields)。
 *           表格渲染复用已学的 @tanstack/react-table（headless 内核），排序/分页数据走 /api/todo 真实接口（服务端算好当前页）。
 *
 * 学习模式：🔧 固定写法（useReactTable + flexRender 渲染；查询参数用 URLSearchParams 拼；表头点击改 sort 重新请求）、
 *          👉 练习点（理解「前端直接拼查询语法 = 后端即接口」，列表页无需写后端）。
 */

// 行是动态字段的普通对象，用宽松类型承接
type Row = Record<string, unknown>

// todo 集合的字段（投影可从中勾选子集）
const ALL_FIELDS = ['id', 'title', 'done', 'createdAt', 'updatedAt']
const RESOURCE = 'todo'

const columnHelper = createColumnHelper<Row>()

export default function ServerQueryTablePage() {
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [totalPages, setTotalPages] = useState(1)

  // 查询条件（仅在点「查询」/翻页/排序时才重新请求，不在输入时自动请求）
  const [keyword, setKeyword] = useState('')
  const [sortField, setSortField] = useState('id')
  const [sortDesc, setSortDesc] = useState(true)
  const [doneIn, setDoneIn] = useState('') // '' | 'true' | 'false' | 'true,false'
  const [idGte, setIdGte] = useState('')
  const [titleLike, setTitleLike] = useState('')
  const [fields, setFields] = useState<string[]>(ALL_FIELDS)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // string | null 联合类型：出错存信息，正常为 null

  // 🔧 关键陷阱：setState 是异步的——「setXxx() 之后立刻调 load()」时，load 里读到的还是旧 state。
  //    所以 load 支持通过 override 把「这次要用的新查询条件」直接传进来，避免读到尚未更新的旧值
  //    （第一次点「重置 / 排序 / 改每页」就会踩坑：请求发的是旧条件，列表显示上次的）。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = async (
    p: number,
    override: Partial<{
      keyword: string
      sortField: string
      sortDesc: boolean
      doneIn: string
      idGte: string
      titleLike: string
      fields: string[]
      pageSize: number
    }> = {},
  ) => {
    setLoading(true)
    setError(null)
    try {
      const kw = override.keyword ?? keyword
      const sf = override.sortField ?? sortField
      const sd = override.sortDesc ?? sortDesc
      const di = override.doneIn ?? doneIn
      const ig = override.idGte ?? idGte
      const tl = override.titleLike ?? titleLike
      const fld = override.fields ?? fields
      const ps = override.pageSize ?? pageSize
      const params = new URLSearchParams()
      params.set('page', String(p))
      params.set('pageSize', String(ps))
      if (sf) params.set('sort', (sd ? '-' : '') + sf)
      if (kw.trim()) {
        params.set('keyword', kw.trim())
        params.set('keywordFields', 'title')
      }
      if (di) params.set('done_in', di) // 字段操作符：done_in=...
      if (ig.trim()) params.set('id_gte', ig.trim()) // 字段操作符：id_gte=...
      if (tl.trim()) params.set('title_like', tl.trim()) // 字段操作符：title_like=...
      if (fld.length) params.set('fields', fld.join(',')) // 投影：只返回勾选字段
      // 真实接口请求：走 /api/todo，绝不直接读 data/*.json
      const r = await fetch(`/api/${RESOURCE}?${params.toString()}`, { cache: 'no-store' })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '查询失败')
      setRows(Array.isArray(j.data) ? j.data : [])
      setTotal(j.total || 0)
      setTotalPages(j.totalPages || 1)
      setPage(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  // 表头点击切换排序：同字段翻转方向，异字段重置为降序
  // ⚠️ 必须先算出新排序值并通过 override 传给 load，否则 load 读到的是旧 sort 状态（第一次点会发旧排序）
  const toggleSort = (field: string) => {
    const nextDesc = sortField === field ? !sortDesc : true
    setSortField(field)
    setSortDesc(nextDesc)
    load(page, { sortField: field, sortDesc: nextDesc })
  }

  // 投影：勾选/取消字段（至少保留一个，避免空表）
  const toggleField = (f: string) => {
    setFields((prev) => {
      const next = prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
      return next.length ? next : prev
    })
  }

  // 列从「勾选的投影字段」动态生成；表头是排序按钮
  const columns = useMemo(
    () =>
      fields.map((f) =>
        columnHelper.accessor((row: Row) => row[f] as unknown, {
          id: f,
          header: () => (
            <button className="sq-sort-btn" onClick={() => toggleSort(f)} title="点击切换排序">
              {f}
              {sortField === f ? (sortDesc ? ' ↓' : ' ↑') : ''}
            </button>
          ),
          cell: (i) => {
            const v = i.getValue()
            if (typeof v === 'boolean') return v ? '✅' : '⬜'
            if (v === null || v === undefined) return '—'
            return String(v)
          },
        }),
      ),
    [fields, sortField, sortDesc],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const resetFilters = () => {
    setKeyword('')
    setIdGte('')
    setTitleLike('')
    setDoneIn('')
    // 关键修复：setState 异步，不能指望 load 里读到刚清空的 state；
    // 把清空后的值通过 override 传入，第一次重置就能拿到「默认(空)条件」的列表
    load(1, { keyword: '', doneIn: '', idGte: '', titleLike: '' })
  }

  return (
    <main className="sq-wrap">
      <style>{css}</style>
      <h1>🔎 服务端查询表格 · Server Query Table</h1>
      <p className="sq-sub">
        检验基座「约定式文件型通用数据接口」的<strong>查询能力</strong>：分页 / 排序 / 关键字 / 字段操作符(
        <code>_in</code> / <code>_gte</code> / <code>_like</code>) / 投影(<code>fields</code>)。 排序与分页数据全部走{' '}
        <code>/api/todo</code> 真实接口（服务端算好当前页），表格渲染复用已学的{' '}
        <code>@tanstack/react-table</code>（headless 内核）。
      </p>

      <div className="sq-filters">
        <label>
          搜索(title 关键字)
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="如 待办" />
        </label>
        <label>
          id ≥ (id_gte)
          <input value={idGte} onChange={(e) => setIdGte(e.target.value)} placeholder="数值" />
        </label>
        <label>
          title 包含 (title_like)
          <input value={titleLike} onChange={(e) => setTitleLike(e.target.value)} placeholder="子串" />
        </label>
        <label>
          done (_in)
          <select value={doneIn} onChange={(e) => setDoneIn(e.target.value)}>
            <option value="">不限</option>
            <option value="true">已完成(true)</option>
            <option value="false">未完成(false)</option>
            <option value="true,false">两者</option>
          </select>
        </label>
        <button className="sq-primary" onClick={() => load(1)}>
          查询
        </button>
        <button className="sq-ghost" onClick={resetFilters}>
          重置
        </button>
      </div>

      <div className="sq-proj">
        <span>投影 fields：</span>
        {ALL_FIELDS.map((f) => (
          <label key={f} className="sq-check">
            <input type="checkbox" checked={fields.includes(f)} onChange={() => toggleField(f)} /> {f}
          </label>
        ))}
      </div>

      {error && <div className="sq-error">查询失败：{error}</div>}
      {/* 无感刷新：加载时保留旧行，只叠一个不占布局的顶部进度条，不用会挤表格的「查询中…」文案块 */}
      {loading && <div className="sq-loading-bar" aria-hidden />}

      {/* 加载中给表格降透明度表示"刷新中"，但内容仍在（stale-while-revalidate），避免清空造成的跳动 */}
      <table className={`sq-table${loading ? ' is-loading' : ''}`}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="sq-th">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="sq-row">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="sq-td">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td className="sq-empty" colSpan={fields.length || 1}>
                无数据
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="sq-pager">
        <button disabled={page <= 1} onClick={() => load(page - 1)}>
          上一页
        </button>
        <span>
          {page} / {totalPages}（共 {total} 条）
        </span>
        <button disabled={page >= totalPages} onClick={() => load(page + 1)}>
          下一页
        </button>
        <label>
          每页
          <select
            value={pageSize}
            onChange={(e) => {
              const ps = Number(e.target.value)
              setPageSize(ps)
              // 同样把新 pageSize 通过 override 传入，避免读到旧 pageSize
              load(1, { pageSize: ps })
            }}
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>

      <details className="sq-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心</b>：基座 <code>/api/todo</code> 直接吃查询语法——<code>page/pageSize</code>(分页)、
            <code>sort/-字段</code>(排序)、<code>keyword</code>(搜索)、<code>字段_操作符</code>(如{' '}
            <code>done_in</code> / <code>id_gte</code> / <code>title_like</code>)、<code>fields</code>(投影)。
            前端拼 URL 即查询，无需写后端。
          </li>
          <li>
            <b>外壳</b>：用 <code>@tanstack/react-table</code> 渲染服务端返回的当前页；表头点击触发{' '}
            <code>sort</code> 参数变化重新请求。换成任意 UI 框架，核心不变。
          </li>
          <li>
            <b>对应基座能力</b>：查询引擎（分页/排序/关键字/字段操作符/投影），是本基座最常用的「列表页」基座能力。
          </li>
          <li>
            <b>真实接口请求</b>：所有查询走 <code>/api/*</code>，绝不直接读 <code>data/*.json</code>。
          </li>
        </ul>
      </details>
    </main>
  )
}

const css = `
.sq-wrap { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.sq-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.sq-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.sq-sub code, .sq-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.sq-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 12px; }
.sq-filters label { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.sq-filters input, .sq-filters select { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; }
.sq-primary { padding: 6px 14px; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }
.sq-ghost { padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
.sq-proj { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 14px; }
.sq-check { display: flex; align-items: center; gap: 4px; }
.sq-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
/* 无感刷新：顶部细进度条 fixed 定位，绝不挤占布局；刷新时表格只降透明度、不清空内容，避免跳动 */
.sq-loading-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
  background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent);
  animation: sq-loadbar .9s linear infinite; }
@keyframes sq-loadbar { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.sq-table.is-loading { opacity: .5; }
.sq-table { width: 100%; border-collapse: collapse; font-size: 14px; transition: opacity .18s ease; }
.sq-th { background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.sq-row:nth-child(even) { background: #fafafa; }
.sq-td { border: 1px solid #e5e7eb; padding: 8px 10px; }
.sq-empty { text-align: center; color: #9ca3af; padding: 16px; }
.sq-sort-btn { background: none; border: none; cursor: pointer; font: inherit; font-weight: 600; color: #111827; padding: 0; }
.sq-pager { display: flex; align-items: center; gap: 12px; margin-top: 12px; font-size: 14px; }
.sq-pager button { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
.sq-pager button:disabled { opacity: 0.4; cursor: not-allowed; }
.sq-pager label { display: flex; align-items: center; gap: 6px; }
.sq-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.sq-details summary { cursor: pointer; font-weight: 600; }
.sq-details ul { line-height: 1.7; padding-left: 20px; }
`

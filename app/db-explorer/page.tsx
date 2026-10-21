'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * 从 Vue2 转 React（db-explorer 篇）
 * Vue2 对照：当年用 axios 拿后端「接口列表」+ element-ui 表格渲染；这里换成 useEffect + fetch + shadcn 表格。
 *
 * 实战定位：🔧 必会 —— 这是基座「约定式文件型通用数据接口」的"控制台 / 元数据"页，
 *           一眼看全所有集合（= data/*.json 文件）及其【自动推断】的字段结构，是最能检验基座能力的入口。
 *
 * 学习模式：🔧 固定写法（useEffect+fetch 列表查询 + alive 防竞态 / StrictMode 双调用）、
 *          👉 练习点（点开集合看基座 inferSchema 自动推断的字段类型与示例值）。
 *
 * 样式：已改为 Tailwind 工具类 + shadcn 组件（Button/Input/Table），设计令牌驱动、暗色自适应；
 *       原 <style>{css}</style> 字符串写法已移除（全局污染 / 硬编码 hex / 暗色失效）。
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
    <main className="mx-auto max-w-[960px] p-6">
      <h1 className="text-2xl font-semibold">🗂 集合管理器 · DB Explorer</h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        这是基座「约定式文件型通用数据接口」的元数据控制台。
        <b className="text-foreground">每个集合 = 一个 data/*.json 文件 = 一套完整 CRUD 接口</b>。
        下方列出全部集合，点开可看基座<strong>自动推断</strong>的字段结构与前 5 条预览。
      </p>

      <div className="mb-3 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          🔄 刷新
        </Button>
        <span className="text-sm text-muted-foreground">共 {list.length} 个集合</span>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          加载失败：{error}
        </div>
      )}
      {loading && <div className="py-3 text-muted-foreground">加载中…</div>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>集合名（= data/&lt;name&gt;.json）</TableHead>
              <TableHead>记录数</TableHead>
              <TableHead>体积</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  暂无集合，用下方表单新建一个试试 👇
                </TableCell>
              </TableRow>
            )}
            {list.map((c) => (
              <TableRow key={c.name} data-state={activeName === c.name ? 'selected' : undefined}>
                <TableCell>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => openDetail(c.name)}
                  >
                    {c.name}
                  </Button>
                </TableCell>
                <TableCell>{c.count}</TableCell>
                <TableCell>{c.sizeText}</TableCell>
                <TableCell>{c.updatedAt}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => openDetail(c.name)}>
                    查看
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-1.5"
                    onClick={() => removeCollection(c.name)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="my-4 flex gap-2">
        <Input
          placeholder="新集合名（字母/数字/_/-）"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={createCollection}>➕ 新建空集合（POST 触发自动建库）</Button>
      </div>

      {detailLoading && <div className="py-3 text-muted-foreground">加载集合详情…</div>}
      {detailError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          详情加载失败：{detailError}
        </div>
      )}

      {detail && (
        <section className="mt-5">
          <h2 className="mb-2 mt-4 text-lg font-semibold">
            📋 {detail.name}{' '}
            <small className="text-sm font-normal text-muted-foreground">
              （{detail.total} 条 · {detail.file}）
            </small>
          </h2>

          <h3 className="mb-1.5 mt-4 text-[15px] font-semibold text-foreground/80">
            自动推断字段结构（schema）
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>字段</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>非空数</TableHead>
                <TableHead>示例值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.schema.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    集合为空，暂无字段可推断
                  </TableCell>
                </TableRow>
              )}
              {detail.schema.map((f) => (
                <TableRow key={f.field}>
                  <TableCell>{f.field}</TableCell>
                  <TableCell>{f.types.join(' / ') || '—'}</TableCell>
                  <TableCell>{f.filled}</TableCell>
                  <TableCell>
                    <code className="cf-code">
                      {f.sample === undefined ? '—' : JSON.stringify(f.sample)}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <h3 className="mb-1.5 mt-4 text-[15px] font-semibold text-foreground/80">前 5 条预览</h3>
          {detail.preview.length === 0 ? (
            <div className="rounded-md bg-muted/50 px-3 py-4 text-center text-muted-foreground">
              集合为空（无记录）
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {previewColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.preview.map((row, i) => (
                  <TableRow key={i}>
                    {previewColumns.map((col) => (
                      <TableCell key={col}>
                        <code className="cf-code">
                          {row[col] === undefined ? '—' : JSON.stringify(row[col])}
                        </code>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      )}

      <details className="cf-prose">
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

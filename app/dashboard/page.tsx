'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * 从 Vue2 转 React（dashboard / aggregate 篇）
 * Vue2 对照：当年用 axios 拉后端「统计接口」+ echarts 画柱状图；这里换成 useEffect+fetch 调基座 /api/{resource}/aggregate + Tailwind 画条形图。
 *
 * 实战定位：🔧 必会 —— 这是基座「约定式文件型通用数据接口」的聚合能力检验入口。
 *           一个 json 文件 = 一张表，基座自动提供 groupBy / sum / avg / min / max 聚合，无需写后端。
 *
 * 学习模式：🔧 固定写法（useEffect 加载集合列表 + useCallback 记忆化聚合请求）、
 *          👉 练习点（理解 groupBy 分组 + count 统计，以及 sum/avg/min/max 对数值字段的含义）。
 *
 * 样式：已改为 Tailwind 工具类 + shadcn 组件（Select/Input/Label/Button/Table），设计令牌驱动、暗色自适应；
 *       原 <style>{css}</style> 字符串写法已移除（全局污染 / 硬编码 hex / 暗色失效）。
 */

// 聚合结果的一行：键不固定（含 groupBy 键、count、以及 sum_*/avg_*/min_*/max_* 指标列），故用宽松类型
type AggRow = Record<string, unknown>

export default function DashboardPage() {
  const [collections, setCollections] = useState<string[]>([])
  const [resource, setResource] = useState('users')
  const [groupBy, setGroupBy] = useState('role')
  const [sumField, setSumField] = useState('')
  const [avgField, setAvgField] = useState('')
  const [minField, setMinField] = useState('')
  const [maxField, setMaxField] = useState('')

  const [rows, setRows] = useState<AggRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // string | null 联合类型：出错存信息，正常为 null

  // 🔧 固定写法：挂载时拉集合列表，填充资源下拉框（只取名字，绝不直接读 data/*.json）
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/collections', { cache: 'no-store' })
        const j = await r.json()
        if (!alive) return
        if (j.code === 0 && Array.isArray(j.data)) {
          setCollections(j.data.map((c: { name: string }) => c.name))
        }
      } catch {
        /* 列表加载失败不影响主流程，下拉框用默认值即可 */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // 🔧 useCallback：记忆化聚合请求，依赖变化时才重建函数引用
  const run = useCallback(
    async (res?: string, gb?: string) => {
      const useRes = res ?? resource
      const useGb = gb ?? groupBy
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (useGb) params.set('groupBy', useGb)
        if (sumField) params.set('sum', sumField)
        if (avgField) params.set('avg', avgField)
        if (minField) params.set('min', minField)
        if (maxField) params.set('max', maxField)
        // 真实接口请求：走 /api/{resource}/aggregate，不碰 data/*.json
        const r = await fetch(`/api/${encodeURIComponent(useRes)}/aggregate?${params.toString()}`, {
          cache: 'no-store',
        })
        const j = await r.json()
        if (j.code !== 0) throw new Error(j.msg || '聚合查询失败')
        setRows(Array.isArray(j.data) ? j.data : [])
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    },
    [resource, groupBy, sumField, avgField, minField, maxField],
  )

  // 预设：一键设好资源 + 分组并立即触发查询
  const preset = useCallback(
    (res: string, gb: string) => {
      setResource(res)
      setGroupBy(gb)
      setSumField('')
      setAvgField('')
      setMinField('')
      setMaxField('')
      void run(res, gb)
    },
    [run],
  )

  // 计算每个分组的 count，找最大值用于条形图比例
  const maxCount = rows.length > 0 ? Math.max(...rows.map((r) => Number(r.count) || 0)) : 0
  // 除 groupBy 键与 count 外的指标列（sum_*/avg_*/min_*/max_*）
  const metricCols = rows.length ? Object.keys(rows[0]).filter((k) => k !== groupBy && k !== 'count') : []

  return (
    <main className="mx-auto max-w-[960px] p-6">
      <h1 className="text-2xl font-semibold">📊 聚合统计仪表盘 · Dashboard</h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        这是基座「约定式文件型通用数据接口」的<strong>聚合能力</strong>检验入口。 每个集合 = 一个
        data/*.json 文件 = 一张表，基座自动提供
        <code className="cf-code">groupBy</code> / <code className="cf-code">sum</code> /{' '}
        <code className="cf-code">avg</code> / <code className="cf-code">min</code> /{' '}
        <code className="cf-code">max</code> 聚合统计，前端无需写后端。
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Label>
          资源
          <Select value={resource} onValueChange={(value) => setResource(String(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="资源" />
            </SelectTrigger>
            <SelectContent>
              {collections.length === 0 ? (
                <SelectItem value={resource}>{resource}</SelectItem>
              ) : (
                collections.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Label>
        <Label>
          分组字段 groupBy
          <Input
            className="w-44"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            placeholder="如 role / status / done"
          />
        </Label>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span className="text-sm text-muted-foreground">数值指标（可选，需数值字段）：</span>
        {(
          [
            ['sum', sumField, setSumField],
            ['avg', avgField, setAvgField],
            ['min', minField, setMinField],
            ['max', maxField, setMaxField],
          ] as const
        ).map(([name, val, setter]) => (
          <Label key={name}>
            {name}
            <Input
              className="w-24"
              value={val}
              onChange={(e) => setter(e.target.value)}
              placeholder="字段"
            />
          </Label>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">预设：</span>
        <Button variant="outline" size="sm" onClick={() => preset('users', 'role')}>
          用户按角色
        </Button>
        <Button variant="outline" size="sm" onClick={() => preset('users', 'status')}>
          用户按状态
        </Button>
        <Button variant="outline" size="sm" onClick={() => preset('todo', 'done')}>
          待办完成分布
        </Button>
        <Button size="sm" onClick={() => run()}>
          查询
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          查询失败：{error}
        </div>
      )}
      {loading && <div className="py-3 text-muted-foreground">聚合中…</div>}

      {!loading && !error && rows.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 mt-4 text-lg font-semibold">分组结果（共 {rows.length} 组）</h2>

          <div className="mb-4 space-y-2">
            {rows.map((r, i) => {
              const key = String(r[groupBy] ?? '—')
              const count = Number(r.count) || 0
              const pct = maxCount ? Math.round((count / maxCount) * 100) : 0
              return (
                <div className="flex items-center gap-2.5 text-sm" key={i}>
                  <span className="w-24 truncate text-right text-muted-foreground">{key}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full rounded bg-gradient-to-r from-sky-400 to-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 font-semibold">{count}</span>
                </div>
              )
            })}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{groupBy || 'group'}</TableHead>
                <TableHead>count</TableHead>
                {metricCols.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{String(r[groupBy] ?? '—')}</TableCell>
                  <TableCell>{String(r.count)}</TableCell>
                  {metricCols.map((c) => (
                    <TableCell key={c}>
                      <code className="cf-code">{JSON.stringify(r[c])}</code>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-md bg-muted/50 px-3 py-4 text-center text-muted-foreground">
          还没有查询结果，点上方预设或「查询」试试。
        </div>
      )}

      <details className="cf-prose">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心</b>：基座 <code>aggregate</code> 模块在内存数组上做 <code>groupBy</code> +{' '}
            <code>count</code> / <code>sum</code> / <code>avg</code> / <code>min</code> / <code>max</code>
            ，无需任何后端代码。一个 json = 一张表，聚合即开即用。
          </li>
          <li>
            <b>外壳</b>：这里只是用 useEffect+fetch 把{' '}
            <code>/api/&#123;resource&#125;/aggregate?groupBy=...</code> 渲染成条形图 + 表格；换成 Vue2 的 axios
            + echarts，核心不变。
          </li>
          <li>
            <b>对应基座能力</b>：聚合统计（group by 分组 + 指标计算）。<code>sum/avg/min/max</code>{' '}
            对数值字段有意义（如 amount/score），当前示例数据数值字段少，主要看 <code>count</code> 分布。
          </li>
          <li>
            <b>真实接口请求</b>：聚合查询全部走 <code>/api/*</code>，绝不直接读 <code>data/*.json</code>。
          </li>
        </ul>
      </details>
    </main>
  )
}

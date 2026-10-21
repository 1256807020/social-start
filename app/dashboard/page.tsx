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
 *
 * ─────────────────────────────────────────────────────────────
 * 【基座 aggregate 接口 · 具体用法速查】
 * 路径   ：GET /api/{resource}/aggregate
 * 信封   ：{ code:0, data:[聚合行...], total, msg }（total = 分组数）
 * 核心思想：一个 JSON 文件 = 一张表，基座自动在内存数组上做
 *          group by + count/sum/avg/min/max，无需任何后端代码。
 *
 * 参数（全部拼在 URL query，可任意组合）：
 *   groupBy : 分组字段名。有它才有分组；省略则对整个集合返回单行统计。
 *   sum     : 数值字段，可逗号分隔多个 → 产出列 sum_字段
 *   avg     : 数值字段，可逗号分隔多个 → 产出列 avg_字段
 *   min     : 数值字段，可逗号分隔多个 → 产出列 min_字段
 *   max     : 数值字段，可逗号分隔多个 → 产出列 max_字段
 *
 * 分组前过滤（聚合会复用查询引擎 applyQuery，仅「非保留参数」生效）：
 *   · 字段等值      ?groupBy=role&status=active      → 只统计 status=active
 *   · 范围操作符     ?groupBy=role&age_gte=18         (支持 _gte/_lte/_gt/_lt)
 *   · 多值/模糊/不等 ?groupBy=role&tag_in=a,b         (支持 _in/_nin/_like/_ne)
 *   ⚠ 注意：page / pageSize / sort / order / keyword / fields / tree 这些
 *           列表查询特性在聚合里被忽略（聚合结果就是全部分组，不分页）。
 *
 * 返回形状示例（users 按 role 分组，并对 amount 求 sum/avg）：
 *   GET /api/users/aggregate?groupBy=role&sum=amount&avg=amount
 *   → data: [
 *       { role:"admin",  count:3, sum_amount:900,  avg_amount:300 },
 *       { role:"editor", count:7, sum_amount:1400, avg_amount:200 },
 *     ]
 *   无 groupBy 时：data: [ { count:10, sum_amount:2300, avg_amount:230 } ]
 *
 * 关键命名规则：指标列名是「前缀_字段」（sum_amount 而非 amount）。
 *   所以页面里 metricCols = 自动抠出 groupBy 键与 count 之外的所有列。
 * ─────────────────────────────────────────────────────────────
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
        // 拼装聚合 query：groupBy + 可选的数值指标（sum/avg/min/max）。
        // 每个参数直接对应上方「基座 aggregate 接口」的用法速查。
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
  // 指标列 = 除 groupBy 键与 count 之外的列，命名规则为「前缀_字段」
  // （sum_*/avg_*/min_*/max_*）。列名不固定，所以这里动态抠出来渲染表头/单元格。
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

      <details className="cf-prose">
        <summary>🧪 真实请求示例 · 直接复制到终端跑（curl）</summary>
        <ul>
          <li>
            <b>用户按角色分组 + 统计每组的 amount 求和/均值：</b>
            <br />
            <code className="cf-code">GET /api/users/aggregate?groupBy=role&sum=amount&avg=amount</code>
            <br />
            返回：
            <code className="cf-code">
              {'[{role:"admin",count:3,sum_amount:900,avg_amount:300}, {role:"editor",count:7,sum_amount:1400,avg_amount:200}]'}
            </code>
          </li>
          <li>
            <b>分组前先过滤（只统计 status=active 的用户，再按 role 分）：</b>
            <br />
            <code className="cf-code">GET /api/users/aggregate?groupBy=role&status=active</code>
          </li>
          <li>
            <b>范围/多值过滤：</b>
            <br />
            <code className="cf-code">GET /api/users/aggregate?groupBy=role&age_gte=18&tag_in=a,b</code>
            <br />
            （支持 <code className="cf-code">_gte/_lte/_gt/_lt/_in/_nin/_like/_ne</code>）
          </li>
          <li>
            <b>不分组，直接整体统计：</b>
            <br />
            <code className="cf-code">GET /api/users/aggregate?sum=amount&max=age</code>
            <br />
            返回单行：<code className="cf-code">{'[{count:10,sum_amount:2300,max_age:65}]'}</code>
          </li>
          <li>
            <b>批量多字段：</b>
            <code className="cf-code">GET /api/orders/aggregate?groupBy=city&sum=price,count&avg=price</code>
            <br />
            列名会变成 <code className="cf-code">sum_price</code> / <code className="cf-code">sum_count</code> /{' '}
            <code className="cf-code">avg_price</code>（逗号分隔的字段各自生成一列）。
          </li>
        </ul>
      </details>
    </main>
  )
}

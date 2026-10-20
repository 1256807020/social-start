'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * 从 Vue2 转 React（dashboard / aggregate 篇）
 * Vue2 对照：当年用 axios 拉后端「统计接口」+ echarts 画柱状图；这里换成 useEffect+fetch 调基座 /api/{resource}/aggregate + 原生 CSS 画条形图。
 *
 * 实战定位：🔧 必会 —— 这是基座「约定式文件型通用数据接口」的聚合能力检验入口。
 *           一个 json 文件 = 一张表，基座自动提供 groupBy / sum / avg / min / max 聚合，无需写后端。
 *
 * 学习模式：🔧 固定写法（useEffect 加载集合列表 + useCallback 记忆化聚合请求）、
 *          👉 练习点（理解 groupBy 分组 + count 统计，以及 sum/avg/min/max 对数值字段的含义）。
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
    <main className="db-wrap">
      <style>{css}</style>
      <h1>📊 聚合统计仪表盘 · Dashboard</h1>
      <p className="db-sub">
        这是基座「约定式文件型通用数据接口」的<strong>聚合能力</strong>检验入口。 每个集合 = 一个
        data/*.json 文件 = 一张表，基座自动提供
        <code>groupBy</code> / <code>sum</code> / <code>avg</code> / <code>min</code> / <code>max</code>{' '}
        聚合统计，前端无需写后端。
      </p>

      <div className="db-controls">
        <label>
          资源
          <select value={resource} onChange={(e) => setResource(e.target.value)}>
            {collections.length === 0 ? (
              <option value={resource}>{resource}</option>
            ) : (
              collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            )}
          </select>
        </label>
        <label>
          分组字段 groupBy
          <input
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            placeholder="如 role / status / done"
          />
        </label>
      </div>

      <div className="db-metrics">
        <span>数值指标（可选，需数值字段）：</span>
        <label>
          sum
          <input value={sumField} onChange={(e) => setSumField(e.target.value)} placeholder="字段" />
        </label>
        <label>
          avg
          <input value={avgField} onChange={(e) => setAvgField(e.target.value)} placeholder="字段" />
        </label>
        <label>
          min
          <input value={minField} onChange={(e) => setMinField(e.target.value)} placeholder="字段" />
        </label>
        <label>
          max
          <input value={maxField} onChange={(e) => setMaxField(e.target.value)} placeholder="字段" />
        </label>
      </div>

      <div className="db-presets">
        <span>预设：</span>
        <button onClick={() => preset('users', 'role')}>用户按角色</button>
        <button onClick={() => preset('users', 'status')}>用户按状态</button>
        <button onClick={() => preset('todo', 'done')}>待办完成分布</button>
        <button className="db-primary" onClick={() => run()}>
          查询
        </button>
      </div>

      {error && <div className="db-error">查询失败：{error}</div>}
      {loading && <div className="db-loading">聚合中…</div>}

      {!loading && !error && rows.length > 0 && (
        <section className="db-result">
          <h2>分组结果（共 {rows.length} 组）</h2>

          <div className="db-bars">
            {rows.map((r, i) => {
              const key = String(r[groupBy] ?? '—')
              const count = Number(r.count) || 0
              const pct = maxCount ? Math.round((count / maxCount) * 100) : 0
              return (
                <div className="db-bar" key={i}>
                  <span className="db-bar-label">{key}</span>
                  <div className="db-bar-track">
                    <div className="db-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="db-bar-value">{count}</span>
                </div>
              )
            })}
          </div>

          <table className="db-table">
            <thead>
              <tr>
                <th>{groupBy || 'group'}</th>
                <th>count</th>
                {metricCols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{String(r[groupBy] ?? '—')}</td>
                  <td>{String(r.count)}</td>
                  {metricCols.map((c) => (
                    <td key={c}>{JSON.stringify(r[c])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="db-empty">还没有查询结果，点上方预设或「查询」试试。</div>
      )}

      <details className="db-details">
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

const css = `
.db-wrap { max-width: 960px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.db-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.db-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.db-sub code, .db-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.db-controls, .db-metrics, .db-presets { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 12px; }
.db-controls label, .db-metrics label { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.db-controls input, .db-controls select, .db-metrics input { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; }
.db-metrics input { width: 90px; }
.db-presets button { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
.db-presets button:hover { background: #f3f4f6; }
.db-presets .db-primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.db-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.db-loading, .db-empty { color: #6b7280; padding: 12px 0; }
.db-result h2 { font-size: 18px; margin: 16px 0 8px; }
.db-bars { margin-bottom: 16px; }
.db-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 14px; }
.db-bar-label { width: 100px; text-align: right; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-bar-track { flex: 1; background: #f3f4f6; border-radius: 6px; height: 22px; overflow: hidden; }
.db-bar-fill { height: 100%; background: linear-gradient(90deg, #60a5fa, #2563eb); }
.db-bar-value { width: 48px; color: #111827; font-weight: 600; }
.db-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.db-table th, .db-table td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.db-table th { background: #f9fafb; font-weight: 600; }
.db-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.db-details summary { cursor: pointer; font-weight: 600; }
.db-details ul { line-height: 1.7; padding-left: 20px; }
`

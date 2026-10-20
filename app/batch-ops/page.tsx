'use client'

import { useEffect, useState } from 'react'

/**
 * 从 Vue 转 React（批量操作 batch-ops 篇）
 * Vue2 对照：早年批量要么后端写个批量接口（/@batch 收数组），要么前端循环 await 多条；
 *            这里基座的约定式 CRUD 天然支持「批量」——POST 直接收数组 = 一次请求插多条，
 *            而且<strong>基座也提供集合级 batch-delete / batch-update 接口</strong>（1 次请求按 id 批量改删）。
 *
 * 实战定位：🔧 必会 —— 检验基座「批量新增」+「集合级批量改删」能力，并对比两种批量写法：
 *   · 集合级（推荐）：POST /api/:resource/batch-delete {ids:[...]} 或 batch-update [{id,...}] —— 1 次请求
 *   · 朴素写法：前端循环调 [id] 路由（PATCH/DELETE /api/:resource/:id）—— N 次单条请求
 *   两者都能用，差别在请求数（网络往返）。日志面板直观显示。
 *
 * 学习模式：🔧 固定写法（POST 数组=批量新增；DELETE ?confirm=1=清空集合；
 *          batch-delete/batch-update=集合级批量改删；[id] 路由=单条改删）、
 *          👉 练习点（理解「集合级 1 次」vs「循环 N 次」的请求数差异）。
 *
 * 数据文件：本例用 tasks 集合（data/tasks.json）。不预建——首次 POST 时基座自动建库（约定式）。
 */

type Row = Record<string, unknown>

const TASKS = 'tasks'

// 批量新增的示例数据（一次 POST 一个数组，演示「一次请求插多条」）
const SAMPLES = [
  { title: '梳理需求文档', done: false },
  { title: '画原型图', done: false },
  { title: '评审技术方案', done: false },
  { title: '搭建项目骨架', done: false },
  { title: '写第一批单测', done: false },
]

export default function BatchOpsPage() {
  const [tasks, setTasks] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set()) // 勾选的 id 集合
  const [newTitle, setNewTitle] = useState('') // 单条新增的输入框
  // 请求日志：把「每一次 fetch」都记下来，直观对比「集合级 1 次」vs「循环 N 次」
  const [logs, setLogs] = useState<string[]>([])

  // 记一条请求日志（带时间戳，保留最近 20 条）
  const log = (m: string) =>
    setLogs((p) => [`${new Date().toLocaleTimeString()}  ${m}`, ...p].slice(0, 20))

  // 拉列表（GET /api/tasks，纯列表请求）
  const loadTasks = async () => {
    const r = await fetch(`/api/${TASKS}`, { cache: 'no-store' })
    const j = await r.json()
    if (j.code === 0) setTasks(Array.isArray(j.data) ? j.data : [])
  }

  useEffect(() => {
    loadTasks().catch((e) => setError(e instanceof Error ? e.message : String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ───────────── 写操作区 ─────────────

  // ① 单条新增：POST 一个对象（对照「批量」用，体会请求数差异）
  const addOne = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    setError(null)
    try {
      log(`POST /api/${TASKS}  ×1（单条）`)
      const r = await fetch(`/api/${TASKS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), done: false }),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '新增失败')
      setNewTitle('')
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ② 批量新增：POST 一个「数组」——基座 handlers.create 收到数组即批量插入（1 次请求插 5 条）
  const batchAdd = async () => {
    setLoading(true)
    setError(null)
    try {
      log(`POST /api/${TASKS}  ×1（数组，批量新增 ${SAMPLES.length} 条）`)
      const r = await fetch(`/api/${TASKS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SAMPLES),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '批量新增失败')
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ③ 清空集合：DELETE ?confirm=1（整集合清空，带二次确认防误删）。这也是「集合级」操作，1 次请求。
  const clearAll = async () => {
    if (!confirm('确定清空整个 tasks 集合？此操作不可恢复。')) return
    setLoading(true)
    setError(null)
    try {
      log(`DELETE /api/${TASKS}?confirm=1  ×1（清空集合）`)
      const r = await fetch(`/api/${TASKS}?confirm=1`, { method: 'DELETE' })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '清空失败')
      setSelected(new Set())
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ── 批量删除：两种写法对照 ──

  // ④a 集合级（推荐）：POST /api/tasks/batch-delete，body {ids:[...]} —— 1 次请求删多条
  //    ⚠️ 这是基座提供的「集合级批量删」接口，和批量新增一样是 1 次请求完成。
  const batchDeleteColl = async () => {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`确定删除选中的 ${ids.length} 条？`)) return
    setLoading(true)
    setError(null)
    try {
      log(`POST /api/${TASKS}/batch-delete  {ids:[${ids.join(',')}]}  ×1（集合级）`)
      const r = await fetch(`/api/${TASKS}/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '批量删除失败')
      setSelected(new Set())
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ④b 朴素写法：前端循环调 [id] 路由（DELETE /api/tasks/:id）—— N 次单条请求
  //    ⚠️ 功能完全等价，只是请求数 = 选中条数。本法不依赖集合级接口，任何有 [id] 路由的资源都能用。
  const batchDeleteLoop = async () => {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`确定删除选中的 ${ids.length} 条？（循环 [id] 朴素写法）`)) return
    setLoading(true)
    setError(null)
    try {
      await Promise.all(
        ids.map(async (id) => {
          log(`DELETE /api/${TASKS}/${id}  ×1（循环）`)
          const r = await fetch(`/api/${TASKS}/${id}`, { method: 'DELETE' })
          const j = await r.json()
          if (j.code !== 0) throw new Error(`删除 ${id} 失败：${j.msg}`)
        }),
      )
      setSelected(new Set())
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ── 批量标记完成：两种写法对照 ──

  // ⑤a 集合级（推荐）：POST /api/tasks/batch-update，body [{id, done:true}, ...] —— 1 次请求改多条
  const batchDoneColl = async () => {
    const ids = [...selected]
    if (!ids.length) return
    setLoading(true)
    setError(null)
    try {
      log(`POST /api/${TASKS}/batch-update  [{ids.map(() => '{id,done}').join(',')}]  ×1（集合级）`)
      const r = await fetch(`/api/${TASKS}/batch-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids.map((id) => ({ id: Number(id), done: true }))),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '批量更新失败')
      setSelected(new Set())
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ⑤b 朴素写法：前端循环 PATCH [id]（PATCH /api/tasks/:id {done:true}）—— N 次单条请求
  const batchDoneLoop = async () => {
    const ids = [...selected]
    if (!ids.length) return
    setLoading(true)
    setError(null)
    try {
      await Promise.all(
        ids.map(async (id) => {
          log(`PATCH /api/${TASKS}/${id}  {done:true}  ×1（循环）`)
          const r = await fetch(`/api/${TASKS}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ done: true }),
          })
          const j = await r.json()
          if (j.code !== 0) throw new Error(`更新 ${id} 失败：${j.msg}`)
        }),
      )
      setSelected(new Set())
      await loadTasks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // ───────────── 选择逻辑 ─────────────
  const toggle = (id: string) => {
    const n = new Set(selected)
    n.has(id) ? n.delete(id) : n.add(id)
    setSelected(n)
  }
  const allChecked = tasks.length > 0 && tasks.every((t) => selected.has(String(t.id)))
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(tasks.map((t) => String(t.id))))

  const renderDone = (v: unknown) => (v ? '✅ 完成' : '⬜ 待办')

  return (
    <main className="bo-wrap">
      <style>{css}</style>
      {loading && <div className="bo-loading-bar" aria-hidden />}
      <h1>📦 批量操作 · Batch Ops Demo</h1>
      <p className="bo-sub">
        检验基座「批量」能力：<strong>批量新增</strong>靠 <code>POST</code> 收数组（1 次请求插多条）；
        <strong>批量改 / 批量删</strong>基座也提供了集合级接口
        <code>batch-delete</code> / <code>batch-update</code>（1 次请求按 id 批量完成）。
        下方同时给出「集合级（1 次）」和「循环 <code>[id]</code>（N 次）」两种写法，勾选若干行点按钮，
        看右侧「请求日志」体会请求数差异。所有请求走 <code>/api/*</code>。
      </p>

      {/* 写操作栏 */}
      <div className="bo-bar">
        <button className="bo-primary" onClick={batchAdd}>
          批量新增 5 条示例
        </button>
        <button className="bo-ghost" onClick={clearAll}>
          清空集合
        </button>
      </div>

      {/* 批量删除：两种写法对照 */}
      <div className="bo-row">
        <span className="bo-row-label">批量删除（选中 {selected.size}）：</span>
        <button className="bo-primary" onClick={batchDeleteColl} disabled={!selected.size}>
          集合级 batch-delete（1 次）
        </button>
        <button className="bo-ghost" onClick={batchDeleteLoop} disabled={!selected.size}>
          循环 [id]（N 次）
        </button>
      </div>

      {/* 批量标记完成：两种写法对照 */}
      <div className="bo-row">
        <span className="bo-row-label">标记完成（选中 {selected.size}）：</span>
        <button className="bo-primary" onClick={batchDoneColl} disabled={!selected.size}>
          集合级 batch-update（1 次）
        </button>
        <button className="bo-ghost" onClick={batchDoneLoop} disabled={!selected.size}>
          循环 [id]（N 次）
        </button>
      </div>

      {/* 单条新增（对照用） */}
      <div className="bo-create">
        <strong>单条新增</strong>
        <input
          placeholder="任务标题"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addOne()}
        />
        <button className="bo-primary" onClick={addOne}>
          新增 1 条
        </button>
      </div>

      {error && <div className="bo-error">出错：{error}</div>}

      <div className="bo-grid">
        <div className="bo-left">
          <table className={`bo-table${loading ? ' is-loading' : ''}`}>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="全选" />
                </th>
                <th>id</th>
                <th>标题</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={String(t.id)} className={selected.has(String(t.id)) ? 'is-sel' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(String(t.id))}
                      onChange={() => toggle(String(t.id))}
                      aria-label={`选择 ${String(t.id)}`}
                    />
                  </td>
                  <td>{String(t.id)}</td>
                  <td>{String(t.title)}</td>
                  <td>{renderDone(t.done)}</td>
                </tr>
              ))}
              {!loading && tasks.length === 0 && (
                <tr>
                  <td className="bo-empty" colSpan={4}>
                    暂无任务，点「批量新增 5 条示例」或上方「新增 1 条」
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 请求日志：把每次 fetch 打出来，直观对比「1 次」vs「N 次」 */}
        <div className="bo-logs">
          <div className="bo-logs-h">📡 请求日志（看请求数）</div>
          {logs.length === 0 ? (
            <div className="bo-logs-empty">操作后会显示每一次请求…</div>
          ) : (
            <ul>
              {logs.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="bo-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心（批量新增）</b>：<code>POST /api/&lt;resource&gt;</code> 的 body 是「对象 = 单条，数组 = 批量」（见
            <code>app/api/[resource]/route.ts</code> 注释）。所以<strong>批量新增只要 1 次请求</strong>。
          </li>
          <li>
            <b>核心（集合级批量改删）</b>：基座<strong>提供</strong>两个集合级接口（都在 <code>basic</code>，所有分支可用）：
            <code>POST /api/&lt;resource&gt;/batch-delete</code>（body <code>{'{ids:[...]}'}</code> 或 <code>?ids=1,2</code>）
            和 <code>POST /api/&lt;resource&gt;/batch-update</code>（body <code>[{'{id,...}'}]</code>）。
            两者都是<strong>1 次请求</strong>完成批量改删——比逐条循环省网络往返。
          </li>
          <li>
            <b>朴素写法（循环 [id]）</b>：没有集合级接口时也能用——前端拿着勾选的 id 循环调
            <code>PATCH/DELETE /api/&lt;resource&gt;/:id</code>。功能等价，但<strong>请求数 = 选中条数（N 次）</strong>。
            本例两种都给出按钮，点一下看日志差异。
          </li>
          <li>
            <b>对比要点</b>：勾 3 行点「集合级 batch-delete」→ 日志只有 <code>POST /batch-delete ×1</code>；
            点「循环 [id]」→ 日志出现 <code>DELETE /:id ×3</code>。这就是「集合级 1 次」vs「逐条循环 N 次」的区别。
          </li>
          <li>
            <b>外壳（UI）</b>：勾选 + 全选 + 两种写法的操作按钮 + 请求日志面板。换成任意框架，核心不变。
          </li>
          <li>
            <b>真实接口请求</b>：全部走 <code>/api/*</code>，绝不直接读 <code>data/*.json</code>；
            <code>tasks.json</code> 不预建，首次 <code>POST</code> 时基座自动建库（约定式 CRUD）。
          </li>
        </ul>
        <table className="bo-compare">
          <thead>
            <tr>
              <th>维度</th>
              <th>Vue2 / 传统后端</th>
              <th>React（本例）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>批量新增</td>
              <td>后端写 @batch 收数组，或前端循环 await</td>
              <td>POST 直接收数组，1 次请求</td>
            </tr>
            <tr>
              <td>批量删除</td>
              <td>后端收 id 数组一次删</td>
              <td>集合级 batch-delete（1 次）或循环 [id]（N 次）</td>
            </tr>
            <tr>
              <td>批量改</td>
              <td>后端收 id 数组一次改</td>
              <td>集合级 batch-update（1 次）或循环 PATCH [id]（N 次）</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  )
}

const css = `
.bo-wrap { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.bo-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.bo-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.bo-sub code, .bo-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.bo-loading-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
  background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent);
  animation: bo-loadbar .9s linear infinite; }
@keyframes bo-loadbar { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.bo-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 14px; }
.bo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; }
.bo-row-label { color: #374151; font-weight: 600; }
.bo-hint { color: #6b7280; font-size: 13px; }
.bo-ghost { padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
.bo-ghost:disabled { opacity: .4; cursor: not-allowed; }
.bo-primary { padding: 6px 14px; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }
.bo-primary:disabled { opacity: .4; cursor: not-allowed; }
.bo-create { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; }
.bo-create input { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; }
.bo-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.bo-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
@media (max-width: 760px) { .bo-grid { grid-template-columns: 1fr; } }
.bo-table { width: 100%; border-collapse: collapse; font-size: 14px; transition: opacity .18s ease; }
.bo-table.is-loading { opacity: .5; }
.bo-table th { background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.bo-table td { border: 1px solid #e5e7eb; padding: 8px 10px; vertical-align: top; }
.bo-table tr:nth-child(even) { background: #fafafa; }
.bo-table tr.is-sel { background: #eff6ff; }
.bo-empty { text-align: center; color: #9ca3af; padding: 16px; }
.bo-logs { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 12px; max-height: 360px; overflow: auto; }
.bo-logs-h { font-family: system-ui, sans-serif; font-weight: 600; color: #93c5fd; margin-bottom: 8px; }
.bo-logs-empty { color: #64748b; }
.bo-logs ul { list-style: none; margin: 0; padding: 0; line-height: 1.7; }
.bo-logs li { border-bottom: 1px solid #1e293b; padding: 2px 0; }
.bo-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.bo-details summary { cursor: pointer; font-weight: 600; }
.bo-details ul { line-height: 1.7; padding-left: 20px; }
.bo-compare { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
.bo-compare th, .bo-compare td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
.bo-compare th { background: #eef2ff; }
`

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

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
 *
 * 样式：已改为 Tailwind 工具类 + shadcn 组件（Checkbox/Button/Input），设计令牌驱动、暗色自适应；
 *       原 <style>{css}</style> 字符串写法已移除（全局污染 / 硬编码 hex / 暗色失效）。
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
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(tasks.map((t) => String(t.id))))

  const renderDone = (v: unknown) => (v ? '✅ 完成' : '⬜ 待办')

  return (
    <main className="mx-auto max-w-[1000px] p-6">
      {loading && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
      <h1 className="text-2xl font-semibold">📦 批量操作 · Batch Ops Demo</h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        检验基座「批量」能力：<strong>批量新增</strong>靠 <code className="cf-code">POST</code> 收数组（1 次请求插多条）；
        <strong>批量改 / 批量删</strong>基座也提供了集合级接口
        <code className="cf-code">batch-delete</code> / <code className="cf-code">batch-update</code>（1 次请求按 id 批量完成）。
        下方同时给出「集合级（1 次）」和「循环 <code className="cf-code">[id]</code>（N 次）」两种写法，勾选若干行点按钮，
        看右侧「请求日志」体会请求数差异。所有请求走 <code className="cf-code">/api/*</code>。
      </p>

      {/* 写操作栏 */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button onClick={batchAdd}>批量新增 5 条示例</Button>
        <Button variant="outline" onClick={clearAll}>
          清空集合
        </Button>
      </div>

      {/* 批量删除：两种写法对照 */}
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5 text-sm">
        <span className="font-semibold">批量删除（选中 {selected.size}）：</span>
        <Button onClick={batchDeleteColl} disabled={!selected.size}>
          集合级 batch-delete（1 次）
        </Button>
        <Button variant="outline" onClick={batchDeleteLoop} disabled={!selected.size}>
          循环 [id]（N 次）
        </Button>
      </div>

      {/* 批量标记完成：两种写法对照 */}
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5 text-sm">
        <span className="font-semibold">标记完成（选中 {selected.size}）：</span>
        <Button onClick={batchDoneColl} disabled={!selected.size}>
          集合级 batch-update（1 次）
        </Button>
        <Button variant="outline" onClick={batchDoneLoop} disabled={!selected.size}>
          循环 [id]（N 次）
        </Button>
      </div>

      {/* 单条新增（对照用） */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <strong>单条新增</strong>
        <Input
          className="w-48"
          placeholder="任务标题"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addOne()}
        />
        <Button onClick={addOne} disabled={!newTitle.trim()}>
          新增 1 条
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          出错：{error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-[1fr_320px]">
        <div>
          <table className={`w-full border-collapse text-sm transition-opacity ${loading ? 'opacity-50' : ''}`}>
            <thead>
              <tr>
                <th className="w-10 border border-border bg-muted px-2.5 py-2 text-left font-semibold">
                  <Checkbox checked={allChecked} onCheckedChange={() => toggleAll()} aria-label="全选" />
                </th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">id</th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">标题</th>
                <th className="border border-border bg-muted px-2.5 py-2 text-left font-semibold">状态</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const id = String(t.id)
                const isSel = selected.has(id)
                return (
                  <tr
                    key={id}
                    className={
                      isSel ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-muted/40'
                    }
                  >
                    <td className="border border-border px-2.5 py-2 align-top">
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={() => toggle(id)}
                        aria-label={`选择 ${id}`}
                      />
                    </td>
                    <td className="border border-border px-2.5 py-2 align-top">{id}</td>
                    <td className="border border-border px-2.5 py-2 align-top">{String(t.title)}</td>
                    <td className="border border-border px-2.5 py-2 align-top">{renderDone(t.done)}</td>
                  </tr>
                )
              })}
              {!loading && tasks.length === 0 && (
                <tr>
                  <td className="border border-border px-2.5 py-4 text-center text-muted-foreground" colSpan={4}>
                    暂无任务，点「批量新增 5 条示例」或上方「新增 1 条」
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 请求日志：把每次 fetch 打出来，直观对比「1 次」vs「N 次」 */}
        <div className="max-h-[360px] overflow-auto rounded-xl border bg-slate-900 p-3 font-mono text-xs text-slate-200">
          <div className="mb-2 font-sans font-semibold text-sky-300">📡 请求日志（看请求数）</div>
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

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（国际化篇）· react-i18next
// · Vue2 对照：vue-i18n（$t 全局、&lt;i18n&gt; 模板），概念几乎一致；
// · Vue3 对照：vue-i18n@9（composition 的 useI18n()），同 react-i18next 心智；
// · React 对照：react-i18next 用 useTranslation() 拿 t()，changeLanguage 切语言（本例）。
// 📌 实战定位：多语言【常规业务常用】；react-i18next 框架无关、生态最全；Next 也可用 next-intl（见 next-middleware-i18n）。
// 🧭 学习模式：🔧固定写法=useTranslation + t() + changeLanguage；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

// 【react-i18next 分支 · learn/react-i18next】
// 演示：i18next + react-i18next 做多语言（国内项目常用，比 next-intl 更框架无关）。
// 业务：复用 /api/todo 做增删改查，UI 文案随语言切换。
import './i18n'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'

type Todo = { id: number; title: string; done: boolean }

export default function ReactI18nPage() {
  const { t } = useTranslation()
  const [todos, setTodos] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  const load = async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${pageSize}&sort=-id`)
    const j = await r.json()
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }

  // 切语言后要刷新翻译（文案在 t() 中实时取，组件重渲染即可）
  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false }),
    })
    setTitle('')
    load(page)
  }
  // Partial<Todo> 等价于 { id?: number; title?: string; done?: boolean } —— 所有字段带 ? 可选。
  const patch = async (id: number, p: Partial<Todo>) => {
    await fetch(`/api/todo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
    load(page)
  }

  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    load(page)
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1)
  // 挂载后发一次首屏列表请求；等价于 Vue2 在 mounted()/created() 里调 load()，空依赖数组 [] 表示「只跑一次」。
  useEffect(() => {
    load(1)
  }, [])
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button className="rounded border px-3 py-1 text-sm" onClick={toggleLang}>
          {t('switchLang')}（{i18n.language === 'zh' ? 'EN' : '中文'}）
        </button>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder={t('newPlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
          {t('add')}
        </button>
        <button className="rounded border px-3 py-1" type="button" onClick={() => load(page)}>
          {t('refresh')}
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!todo.done} onChange={() => patch(todo.id, { done: !todo.done })} />
            {editing?.id === todo.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  patch(todo.id, { title: editing.title })
                  setEditing(null)
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editing?.title ?? ''}
                  onChange={(e) => setEditing({ id: todo.id, title: e.target.value })}
                />
                <button className="rounded bg-green-600 px-2 py-1 text-white" type="submit">
                  {t('save')}
                </button>
              </form>
            ) : (
              <span
                className={`flex-1 ${todo.done ? 'line-through text-gray-400' : ''}`}
                onDoubleClick={() => setEditing({ id: todo.id, title: todo.title })}
              >
                #{todo.id} {todo.title}
              </span>
            )}
            <button className="text-sm text-blue-600" onClick={() => setEditing({ id: todo.id, title: todo.title })}>
              {t('edit')}
            </button>
            <button className="text-sm text-red-600" onClick={() => remove(todo.id)}>
              {t('delete')}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page <= 1} onClick={() => load(page - 1)}>
          {t('prev')}
        </button>
        <span>
          {page} / {totalPages}（{t('total')} {total}）
        </span>
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page >= totalPages} onClick={() => load(page + 1)}>
          {t('next')}
        </button>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">取文案</td><td className="px-2 py-1">$t(...)</td><td className="px-2 py-1">useI18n().t</td><td className="px-2 py-1">useTranslation().t（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">切语言</td><td className="px-2 py-1">$i18n.locale=</td><td className="px-2 py-1">locale.value=</td><td className="px-2 py-1">i18n.changeLanguage</td></tr>
            <tr className="border-b"><td className="px-2 py-1">配置</td><td className="px-2 py-1">对象配置</td><td className="px-2 py-1">对象配置</td><td className="px-2 py-1">{'i18n.init({resources})'}</td></tr>
            <tr className="border-b"><td className="px-2 py-1">生态</td><td className="px-2 py-1">vue-i18n</td><td className="px-2 py-1">vue-i18n@9</td><td className="px-2 py-1">react-i18next</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：i18n 心智三框架一致；CRUD 仍走 /api/todo，文案随语言实时切换。</p>
      </details>

    </main>
  )
}

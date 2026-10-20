'use client'

import { useEffect, useState } from 'react'

/**
 * 从 Vue 转 React（populate 外键联表篇）
 * Vue2 对照：当年要么后端写 SQL JOIN 把两表拼成一行，要么前端循环「每篇文章再去查作者」N+1 次；
 *            这里基座用 ?populate=字段:集合:外键 一行参数，就把 posts.author 里存的「用户 id」
 *            原地替换成 users 的整条记录，前端零 JOIN 代码、零 N+1。
 *
 * 实战定位：🔧 必会（补你的短板）—— 检验基座「关联查询 populate」能力：
 *           一条实体一条记录 + 动态字段；posts.author 存作者 id（外键），
 *           GET /api/posts?populate=author:users 自动联出作者整条记录。
 *
 * 学习模式：🔧 固定写法（GET 列表带 ?populate 参数；POST 新建时 author 写外键值）、
 *          👉 练习点（理解「外键 = 一个 id；联表 = 该字段被替换成整条记录」）。
 *
 * 两个数据文件的关系（很关键，搞清楚才不会被坑）：
 *   · data/posts.json  —— 本例主表。可被删：删掉后刷新页面，「填充示例数据」按钮会亮，
 *                          点一下就重新批量插入 4 条（author 写 1/2/3 这几个外键值）。
 *   · data/users.json  —— 联表目标（被引用的「用户表」）。可删可留，但它承载 populate 的目标。
 *                          基座联表时拿 posts.author 的值（如 1）去 users.json 按 id 匹配；
 *                          若 users.json 被删/为空，匹配不到，author 会被置为 null（见 lib/populate.ts:42），
 *                          表格作者列就显示不出作者了。所以「示例完整运行（能看到作者名）」
 *                          需要保留 users.json，且里面的 id 必须覆盖 posts 用到的 1 / 2 / 3。
 */

type Row = Record<string, unknown>

const POSTS = 'posts'
const USERS = 'users'

export default function PopulateDemoPage() {
  // ⚠️ 本示例最关键的一个心智模型（也是最容易迷糊的地方）：
  // posts 这一个 state 里，每条记录的 author 字段「类型会随开关变化」——
  //   · 关掉关联（populateOn=false）：author 是「数字 id」（外键原值，如 1 / 2 / 3）
  //   · 打开关联（populateOn=true）：author 被基座「原地替换」成「整条用户对象」{id,name,email,...}
  // 也就是说：同一个 posts[i].author，一会儿是 number，一会儿是 object。
  // 这正是后端「populate 联表」的直观体现 —— 它不是返回两份数据，而是「改写那个字段」。
  // 前端因此用 renderAuthor() 做「类型判断」来渲染（见下方）。
  const [posts, setPosts] = useState<Row[]>([])
  const [users, setUsers] = useState<Row[]>([]) // 作者集合：既用于「新建」下拉，也说明联表数据从哪来
  const [populateOn, setPopulateOn] = useState(true) // 教程默认开：直接看联表结果
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // string | null 联合类型：出错存信息，正常为 null

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('1') // 新建时选中的作者 id（字符串，提交时转 Number 写外键）

  // 拉作者集合（GET /api/users，纯列表请求）。
  // ⚠️ 这个 users 是「联表目标」：填充按钮插的 4 条 posts 的 author(1/2/3) 必须在这里能匹配到，
  //    联表列才显示得出作者名。若 users.json 被删，这里会返回 data:[]（不报错），
  //    但 populate 仍会把 author 置成 null（见 lib/populate.ts）—— 表头「新建」下拉也会空。
  const loadUsers = async () => {
    const r = await fetch(`/api/${USERS}`, { cache: 'no-store' })
    const j = await r.json()
    if (j.code === 0) setUsers(Array.isArray(j.data) ? j.data : [])
  }

  // 拉文章列表；withPopulate 决定是否带 ?populate=author:users
  // ⚠️ 同 server-query-table 的 stale closure 教训：开关值通过参数传入，不依赖 setState 后的闭包
  // 返回的数据形状（关键）：
  //   · 不带 populate -> 每条 {id,title,body,author: 1, ...}            author 是数字 id（外键）
  //   · 带   populate -> 每条 {id,title,body,author:{id:1,name:'张三',...}, ...}  author 被替换成整条用户
  // 后端怎么做的：见 lib/populate.ts（拿 author 的值去 data/users.json 按 id 匹配，命中则替换该字段）
  const loadPosts = async (withPopulate: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      // author:users -> 去 users 集合按 id 匹配（users.json 没有 uid 字段，所以不能用 author:users:uid）
      if (withPopulate) params.set('populate', 'author:users')
      const r = await fetch(`/api/${POSTS}?${params.toString()}`, { cache: 'no-store' })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '查询失败')
      setPosts(Array.isArray(j.data) ? j.data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadPosts(populateOn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 作者下拉「兜底」：所选 author 不在 users 里（比如该用户被删除了）时，自动切到第一个可用用户。
  // 不兜底会踩坑：<select value="1"> 但已没有 id=1 的 option 时，浏览器「界面显示第一项」，
  // 而 state 仍是 '1' —— 看起来选了李四，点发布写进去的却是悬空外键 author=1。
  useEffect(() => {
    if (!users.length) return
    if (!users.some((u) => String(u.id) === author)) {
      setAuthor(String(users[0].id))
    }
  }, [users, author])

  // 切换 populate：重新请求（新值通过参数传，避免读到旧 state）
  const togglePopulate = (v: boolean) => {
    setPopulateOn(v)
    loadPosts(v)
  }

  // 新建文章：POST 一条，author 写「用户 id」（外键），联表时再被替换成整条作者
  const createPost = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      const r = await fetch(`/api/${POSTS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), author: Number(author) }),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '新建失败')
      setTitle('')
      setBody('')
      await loadPosts(populateOn)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // 填充示例数据（batch-create 批量插入，演示基座「任意资源名自动建库」）。
  // 这个按钮只在 posts.json 为空时可用（disabled={posts.length>0}），作用是「一键灌 4 条示例」。
  // 📌 posts.json 可被删：删掉后刷新，按钮亮、点此即重建这 4 条。
  // 📌 注意每条的 author(1/2/3) 是外键值，指向 data/users.json 的 id；
  //    要让联表完整跑通，users.json 里得有 id=1/2/3 的用户（删了 users.json 联表列就空）。
  const seed = async () => {
    setLoading(true)
    try {
      // author 字段写的是「用户 id」（外键），不是作者对象本体 —— 联表时由基座替换成整条用户
      const samples = [
        { title: '基座的约定式 CRUD 真香', body: '一个 json 文件就是一张表。', author: 1 },
        { title: '前端不用管后端了', body: '只要建 data/posts.json。', author: 2 },
        { title: 'populate 联表太方便', body: '外键自动替换成整条作者记录。', author: 3 },
        { title: '动态字段的威力', body: '想加字段就加。', author: 1 },
      ]
      const r = await fetch(`/api/${POSTS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samples),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '填充失败')
      await loadPosts(populateOn)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // 作者单元格渲染：根据 author 当前「类型/值」分支（这正是 populate 联表的直观体现）
  //   · 关关联时 value 是 number（外键 id）           -> 显示「外键 id：1」
  //   · 开关联时 value 是 object（整条用户）           -> 显示「张三 @admin · zhang@x.com」
  //   · 开关联但 users.json 被删（匹配不到）-> value 是 null -> 显示「（用户不存在）」
  // 注意：第 3 种只发生在「开关联」时；若把开关关掉，author 仍是 posts.json 里的原始 id（1/2/3），能正常显示。
  const renderAuthor = (value: unknown) => {
    if (value == null) return <span className="pd-fk">（用户不存在）</span>
    if (typeof value === 'object') {
      const u = value as Row
      return (
        <span className="pd-author">
          <b>{String(u.name ?? '?')}</b>
          <small>@{String(u.role ?? '-')} · {String(u.email ?? '-')}</small>
        </span>
      )
    }
    return <span className="pd-fk">外键 id：{String(value)}</span>
  }

  return (
    <main className="pd-wrap">
      <style>{css}</style>
      {loading && <div className="pd-loading-bar" aria-hidden />}
      <h1>🔗 外键联表 · Populate Demo</h1>
      <p className="pd-sub">
        检验基座「关联查询 <code>populate</code>」能力：<code>posts.author</code> 存的是<strong>作者 id（外键）</strong>，
        加 <code>?populate=author:users</code> 后，该字段会被原地替换成 <code>users</code> 的<strong>整条作者记录</strong>。
        切换下面的开关对比「外键原值 vs 联表结果」。所有请求走 <code>/api/*</code>，绝不直接读 <code>data/*.json</code>。
      </p>

      <div className="pd-bar">
        <label className="pd-toggle">
          <input type="checkbox" checked={populateOn} onChange={(e) => togglePopulate(e.target.checked)} />
          关联作者（<code>?populate=author:users</code>）
        </label>
        <span className="pd-hint">
          {populateOn ? '已联表：author 是整条作者对象' : '未联表：author 只是外键 id'}
        </span>
        {/* 填充示例数据：只在「集合为空」时可用。disabled = 已有数据就禁用，避免重复插入（重复插会出多条副本）
            想重新灌：删掉 data/posts.json 再刷新，或把已有数据删空，按钮就亮了。 */}
        <button className="pd-ghost" onClick={seed} disabled={posts.length > 0}>
          填充示例数据
        </button>
      </div>

      <div className="pd-create">
        <strong>新建文章</strong>
        <input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="正文" value={body} onChange={(e) => setBody(e.target.value)} />
        <select value={author} onChange={(e) => setAuthor(e.target.value)}>
          {users.map((u) => (
            <option key={String(u.id)} value={String(u.id)}>
              {String(u.name)}（id={String(u.id)}）
            </option>
          ))}
        </select>
        <button className="pd-primary" onClick={createPost}>
          发布
        </button>
      </div>

      {error && <div className="pd-error">出错：{error}</div>}

      <table className={`pd-table${loading ? ' is-loading' : ''}`}>
        <thead>
          <tr>
            <th>id</th>
            <th>标题</th>
            <th>正文</th>
            <th>作者（{populateOn ? '已联表' : '外键 id'}）</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={String(p.id)}>
              <td>{String(p.id)}</td>
              <td>{String(p.title)}</td>
              <td className="pd-body">{String(p.body)}</td>
              <td>{renderAuthor(p.author)}</td>
            </tr>
          ))}
          {!loading && posts.length === 0 && (
            <tr>
              <td className="pd-empty" colSpan={4}>
                暂无文章，点「填充示例数据」或上方「新建文章」
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <details className="pd-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心（外键 + 联表）</b>：<code>posts.author</code> 只存一个 id（外键），不冗余作者信息；
            联表时基座按 <code>?populate=字段:集合:外键</code> 把该字段替换成整条记录。相当于 SQL 的
            <code>JOIN</code>，但前端不用写、后端也不用另写——参数即查询。
          </li>
          <li>
            <b>三段式语法</b>：<code>字段:集合:外键</code>。本例 <code>author:users</code> = 取 posts.author 的值，
            去 <code>users</code> 集合按 <code>id</code> 匹配（外键默认就是 id）。若 users 用 <code>uid</code> 作主键，
            则写 <code>author:users:uid</code>。多字段用英文逗号：<code>?populate=author,category</code>。
          </li>
          <li>
            <b>外壳（UI）</b>：表格展示联表结果；开关切换「外键原值 / 整条记录」直观对比；下拉选作者新建文章。
            换成任意框架，核心不变。
          </li>
          <li>
            <b>真实接口请求</b>：列表、新建、批量填充全走 <code>/api/*</code>，绝不直接读 <code>data/*.json</code>；
            新建时 author 写外键值，联表由基座完成。
          </li>
          <li>
            <b>引用完整性（外键悬空）</b>：本例没有数据库外键约束——删掉某个用户后，
            posts 里仍留着指向它的 author 值。联表匹配不到，基座会把该字段置为 <code>null</code>，
            页面显示「（用户不存在）」。真实 SQL 里这叫「悬空外键」，通常由 FK 约束报错或
            <code>ON DELETE SET NULL</code> 处理。
            <br />
            🧪 <b>课堂实验</b>：把 <code>data/users.json</code> 里的某个用户（或整个文件）删掉，
            刷新页面 → 关联开关打开时，对应文章的作者列变成「（用户不存在）」；
            关掉开关 → author 仍是 <code>posts.json</code> 里的原始 id，可直观对比「外键原值 vs 联表结果」。
          </li>
        </ul>
        <table className="pd-compare">
          <thead>
            <tr><th>维度</th><th>Vue2 / 传统后端</th><th>Vue3</th><th>React（本例）</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>怎么「联表」</td>
              <td>后端写 SQL JOIN，或前端循环 N+1 查</td>
              <td>同左（Axios 循环请求）</td>
              <td>一行 <code>?populate=</code> 参数，前端零 JOIN</td>
            </tr>
            <tr>
              <td>外键存什么</td>
              <td>对方表的主键 id</td>
              <td>对方表的主键 id</td>
              <td>对方表的主键 id（本例 users.id）</td>
            </tr>
            <tr>
              <td>联表结果在哪</td>
              <td>后端拼好的一行</td>
              <td>前端自己拼对象</td>
              <td>基座把 <code>author</code> 字段原地替换为整条记录</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  )
}

const css = `
.pd-wrap { max-width: 920px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.pd-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.pd-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.pd-sub code, .pd-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.pd-loading-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
  background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent);
  animation: pd-loadbar .9s linear infinite; }
@keyframes pd-loadbar { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.pd-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 14px; }
.pd-toggle { display: flex; align-items: center; gap: 6px; }
.pd-hint { color: #6b7280; font-size: 13px; }
.pd-ghost { padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
.pd-ghost:disabled { opacity: .4; cursor: not-allowed; }
.pd-create { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; }
.pd-create input, .pd-create select { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 8px; }
.pd-primary { padding: 6px 14px; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }
.pd-error { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.pd-table { width: 100%; border-collapse: collapse; font-size: 14px; transition: opacity .18s ease; }
.pd-table.is-loading { opacity: .5; }
.pd-table th { background: #f9fafb; font-weight: 600; border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.pd-table tr:nth-child(even) { background: #fafafa; }
.pd-table td { border: 1px solid #e5e7eb; padding: 8px 10px; vertical-align: top; }
.pd-body { color: #4b5563; }
.pd-author { display: flex; flex-direction: column; }
.pd-author b { color: #111827; }
.pd-author small { color: #6b7280; }
.pd-fk { color: #9ca3af; font-family: ui-monospace, monospace; }
.pd-empty { text-align: center; color: #9ca3af; padding: 16px; }
.pd-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.pd-details summary { cursor: pointer; font-weight: 600; }
.pd-details ul { line-height: 1.7; padding-left: 20px; }
.pd-compare { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
.pd-compare th, .pd-compare td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
.pd-compare th { background: #eef2ff; }
`

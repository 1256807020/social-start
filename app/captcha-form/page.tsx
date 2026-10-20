'use client'

import { useEffect, useState } from 'react'

/**
 * 从 Vue 转 React（图形验证码 captcha 篇）
 * Vue2 对照：早年自己引 svg-captcha 后端 + 前端拿 base64 显示，或前端 canvas 手画；
 *            这里基座直接提供 /api/captcha 生成（返回 SVG data URI）+ /api/captcha/verify 校验，
 *            前端只要 <img src={image}> 显示、把 captchaId 跟着表单一起提交校验即可。
 *
 * 实战定位：🔧 必会 —— 表单防刷 / 人机校验是极常见需求。
 *
 * 学习模式：🔧 固定写法（GET 拿 {captchaId,image} → <img src> 显示 → 用户输入 code → POST verify {captchaId,code}）、
 *          👉 练习点（captchaId 必须跟着图片走，每次刷新重新拉；验证码一次性，校验后须刷新）。
 *
 * 数据：验证码走基座 captcha 模块（/api/captcha、/api/captcha/verify），非自建 <resource>。
 */

type Captcha = { captchaId: string; image: string }

export default function CaptchaFormPage() {
  const [captcha, setCaptcha] = useState<Captcha | null>(null)
  const [code, setCode] = useState('')
  const [result, setResult] = useState<'ok' | 'fail' | null>(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 请求日志：把每一次 fetch 打出来，直观看到「刷新 = 1 次 GET，校验 = 1 次 POST」
  const [logs, setLogs] = useState<string[]>([])

  const log = (m: string) =>
    setLogs((p) => [`${new Date().toLocaleTimeString()}  ${m}`, ...p].slice(0, 20)])

  // ── 核心写法 ①：拉取验证码（GET /api/captcha）──
  // 返回 { captchaId, image }，image 是 SVG 的 data URI，直接 <img src={image}> 显示
  const refresh = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setMsg('')
    try {
      log(`GET /api/captcha  ×1`)
      const r = await fetch('/api/captcha', { cache: 'no-store' })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '获取验证码失败')
      setCaptcha(j.data as Captcha)
      setCode('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 核心写法 ②：校验（POST /api/captcha/verify）──
  // 把 captchaId（跟着图片走）和用户输入的 code 一起提交；一次性，校验完必须刷新
  const verify = async () => {
    if (!captcha) return
    if (!code.trim()) {
      setError('请先输入验证码')
      return
    }
    setLoading(true)
    setError(null)
    try {
      log(`POST /api/captcha/verify  {captchaId, code}  ×1`)
      const r = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captchaId: captcha.captchaId, code: code.trim() }),
      })
      const j = await r.json()
      if (j.code !== 0) throw new Error(j.msg || '校验失败')
      const ok = !!(j.data && j.data.success)
      setResult(ok ? 'ok' : 'fail')
      setMsg(ok ? '校验通过 ✅' : '验证码错误 ❌')
      // 一次性：无论成败都刷新一张新的（旧 captchaId 已作废）
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="cf-wrap">
      <style>{css}</style>
      {loading && <div className="cf-loading-bar" aria-hidden />}
      <h1>🔐 图形验证码 · Captcha Form Demo</h1>
      <p className="cf-sub">
        检验基座「图形验证码」能力：<code>GET /api/captcha</code> 拿到 <code>{'{captchaId, image}'}</code>
        （<code>image</code> 是 SVG data URI，直接 <code>&lt;img src&gt;</code> 显示）；
        用户输入后 <code>POST /api/captcha/verify {'{captchaId, code}'}</code> 校验（一次性）。
        右侧「请求日志」看「刷新 = 1 次 GET，校验 = 1 次 POST」。
      </p>

      <div className="cf-grid">
        <div className="cf-left">
          <div className="cf-card">
            <div className="cf-card-h">验证码表单（跟着图片走的 captchaId）</div>
            <div className="cf-captcha">
              {captcha ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={captcha.image} alt="验证码" className="cf-img" />
              ) : (
                <div className="cf-img-placeholder">加载中…</div>
              )}
              <button className="cf-ghost" onClick={refresh} disabled={loading}>
                刷新验证码
              </button>
            </div>
            <input
              className="cf-input"
              placeholder="请输入上方验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
            />
            <button className="cf-primary" onClick={verify} disabled={loading || !captcha}>
              校验
            </button>

            {result && (
              <div className={result === 'ok' ? 'cf-result ok' : 'cf-result fail'}>{msg}</div>
            )}
            {error && <div className="cf-error">出错：{error}</div>}
            <div className="cf-hint">
              试试：看不准就点「刷新验证码」重新拉一张；校验不论成败都会自动刷新（验证码一次性）。
            </div>
          </div>
        </div>

        {/* 请求日志 */}
        <div className="cf-logs">
          <div className="cf-logs-h">📡 请求日志（刷新 = 1 GET，校验 = 1 POST）</div>
          {logs.length === 0 ? (
            <div className="cf-logs-empty">操作后会显示每一次请求…</div>
          ) : (
            <ul>
              {logs.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="cf-details">
        <summary>🧠 核心 vs 外壳 · 这个示例在练什么</summary>
        <ul>
          <li>
            <b>核心（取验证码）</b>：<code>GET /api/captcha</code> → 解包 <code>j.data</code> 得到
            <code>{'{ captchaId, image }'}</code>。<code>image</code> 是 SVG 的
            <strong>data URI</strong>（形如 <code>data:image/svg+xml;base64,...</code>），直接
            <code>&lt;img src={image}&gt;</code> 显示，<strong>不用自己读 FileReader / 不依赖额外静态文件</strong>。
          </li>
          <li>
            <b>核心（校验）</b>：把<strong>当前这张图的 captchaId</strong>（和用户输入的 code）一起
            <code>POST /api/captcha/verify</code>。校验在后端按 captchaId 比对，<strong>一次性</strong>——
            用完即废，下次必须重新 <code>GET /api/captcha</code> 拉新图。
          </li>
          <li>
            <b>练习点（captchaId 跟着图片走）</b>：captchaId 是这张图的唯一标识，绝不能用旧 id 配新图/旧图配新输入。
            本例把它存在 state 里，点「刷新」就整体替换，避免串号。
          </li>
          <li>
            <b>外壳（UI）</b>：图片 + 输入框 + 刷新/校验按钮 + 结果提示 + 请求日志。换成任意框架，核心不变。
          </li>
          <li>
            <b>真实接口请求</b>：全部走 <code>/api/*</code>，绝不直读基座内部存储。读操作（GET）天然开放；verify 是
            POST 但校验本身不写数据，教学态默认无 ADMIN_TOKEN 直接可用。
          </li>
        </ul>
        <table className="cf-compare">
          <thead>
            <tr>
              <th>维度</th>
              <th>Vue2 / 传统</th>
              <th>React（本例）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>生成</td>
              <td>后端 svg-captcha + 前端 base64 显示</td>
              <td>GET 返回 SVG data URI，&lt;img src&gt; 直显</td>
            </tr>
            <tr>
              <td>校验</td>
              <td>表单带 captchaId + code 提交后端比对</td>
              <td>POST verify {'{captchaId, code}'}，一次性</td>
            </tr>
            <tr>
              <td>刷新</td>
              <td>重新请求换一张</td>
              <td>重新 GET，替换 captchaId+image</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  )
}

const css = `
.cf-wrap { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, "PingFang SC", sans-serif; color: #1f2937; }
.cf-wrap h1 { font-size: 24px; margin: 0 0 8px; }
.cf-sub { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
.cf-sub code, .cf-details code { background: #eef2ff; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.cf-loading-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
  background: linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent);
  animation: cf-loadbar .9s linear infinite; }
@keyframes cf-loadbar { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.cf-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
@media (max-width: 760px) { .cf-grid { grid-template-columns: 1fr; } }
.cf-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; }
.cf-card-h { font-weight: 600; margin-bottom: 10px; font-size: 14px; }
.cf-captcha { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.cf-img { height: 48px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.cf-img-placeholder { height: 48px; width: 120px; display: flex; align-items: center; justify-content: center; color: #9ca3af; border: 1px dashed #d1d5db; border-radius: 8px; }
.cf-input { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }
.cf-primary { padding: 7px 16px; border: none; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; font-size: 14px; }
.cf-ghost { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; font-size: 13px; }
.cf-ghost:disabled, .cf-primary:disabled { opacity: .4; cursor: not-allowed; }
.cf-result { margin-top: 10px; padding: 8px 10px; border-radius: 8px; font-size: 14px; }
.cf-result.ok { background: #ecfdf5; color: #047857; }
.cf-result.fail { background: #fef2f2; color: #b91c1c; }
.cf-error { background: #fef2f2; color: #b91c1c; padding: 8px 10px; border-radius: 8px; margin-top: 10px; }
.cf-hint { color: #6b7280; font-size: 13px; margin-top: 10px; line-height: 1.5; }
.cf-logs { background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 12px; max-height: 360px; overflow: auto; }
.cf-logs-h { font-family: system-ui, sans-serif; font-weight: 600; color: #93c5fd; margin-bottom: 8px; }
.cf-logs-empty { color: #64748b; }
.cf-logs ul { list-style: none; margin: 0; padding: 0; line-height: 1.7; }
.cf-logs li { border-bottom: 1px solid #1e293b; padding: 2px 0; }
.cf-details { margin-top: 24px; background: #f9fafb; border-radius: 10px; padding: 12px 16px; }
.cf-details summary { cursor: pointer; font-weight: 600; }
.cf-details ul { line-height: 1.7; padding-left: 20px; }
.cf-compare { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
.cf-compare th, .cf-compare td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
.cf-compare th { background: #eef2ff; }
`

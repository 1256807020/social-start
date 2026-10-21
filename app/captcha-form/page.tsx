'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
 *
 * 样式：已改为 Tailwind 工具类 + shadcn 组件（Button/Input/Card/Alert），设计令牌驱动、暗色自适应；
 *       原 <style>{css}</style> 字符串写法已移除（全局污染 / 硬编码 hex / 暗色失效）。
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
    setLogs((p) => [`${new Date().toLocaleTimeString()}  ${m}`, ...p].slice(0, 20))

  // ── 核心写法 ①：拉取验证码（GET /api/captcha）──
  // 返回 { captchaId, image }，image 是 SVG 的 data URI，直接 <img src={image}> 显示
  // keepResult=true 用于「校验后自动刷新」：保留上一次校验结果让用户看到成败，不再清空
  const refresh = async (keepResult = false) => {
    setLoading(true)
    setError(null)
    if (!keepResult) {
      setResult(null)
      setMsg('')
    }
    try {
      log('GET /api/captcha  ×1')
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
      log('POST /api/captcha/verify  {captchaId, code}  ×1')
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
      // 一次性：无论成败都刷新一张新的（旧 captchaId 已作废）；保留本次校验结果让用户看到成败
      await refresh(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-[1000px] p-6">
      {loading && (
        <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-transparent">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
      <h1 className="text-2xl font-semibold">🔐 图形验证码 · Captcha Form Demo</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        检验基座「图形验证码」能力：<code className="cf-code">GET /api/captcha</code> 拿到{' '}
        <code className="cf-code">{'{ captchaId, image }'}</code>（<code className="cf-code">image</code> 是 SVG data URI，直接{' '}
        <code className="cf-code">&lt;img src&gt;</code> 显示）；用户输入后{' '}
        <code className="cf-code">POST /api/captcha/verify {'{captchaId, code}'}</code> 校验（一次性）。
        右侧「请求日志」看「刷新 = 1 次 GET，校验 = 1 次 POST」。
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 min-[760px]:grid-cols-[1fr_320px]">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                验证码表单（跟着图片走的 captchaId）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {captcha ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={captcha.image}
                    alt="验证码"
                    className="h-12 rounded-md border bg-background"
                  />
                ) : (
                  <div className="flex h-12 w-[120px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    加载中…
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
                  刷新验证码
                </Button>
              </div>
              <Input
                placeholder="请输入上方验证码"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setResult(null)
                  setMsg('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && verify()}
              />
              <Button onClick={verify} disabled={loading || !captcha}>
                校验
              </Button>

              {result && (
                <div
                  className={
                    result === 'ok'
                      ? 'rounded-md bg-emerald-50 px-2.5 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'rounded-md bg-destructive/10 px-2.5 py-2 text-sm text-destructive'
                  }
                >
                  {msg}
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>出错：{error}</AlertDescription>
                </Alert>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                试试：看不准就点「刷新验证码」重新拉一张；校验不论成败都会自动刷新（验证码一次性）。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 请求日志 */}
        <div className="min-h-[360px] overflow-auto rounded-xl border bg-slate-900 p-3 font-mono text-xs text-slate-200">
          <div className="mb-2 font-sans font-semibold text-sky-300">
            📡 请求日志（刷新 = 1 GET，校验 = 1 POST）
          </div>
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
            <b>核心（取验证码）</b>：<code>GET /api/captcha</code> → 解包 <code>j.data</code> 得到
            <code>{'{ captchaId, image }'}</code>。<code>image</code> 是 SVG 的
            <strong>data URI</strong>（形如 <code>data:image/svg+xml;base64,...</code>），直接
            <code>{'<img src={image}>'}</code> 显示，<strong>不用自己读 FileReader / 不依赖额外静态文件</strong>。
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
        <table>
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

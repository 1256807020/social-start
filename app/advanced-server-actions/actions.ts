'use server'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import type { ActionState } from './types'

// 服务端内网调用：Server Action 跑在服务器，相对路径无法解析，需用请求 host 拼绝对 base；
// 启用 ADMIN_TOKEN 时顺带带鉴权头（与 basic 范本一致）。
async function buildBase() {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:4000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const hd: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.ADMIN_TOKEN) hd['x-admin-token'] = process.env.ADMIN_TOKEN
  return { base, hd }
}

async function handle(res: Response): Promise<ActionState> {
  if (!res.ok) {
    const j = await res.json().catch(() => null)
    return { ok: false, error: (j && j.error) || `请求失败(${res.status})` }
  }
  return { ok: true }
}

// ── 增：返回 ActionState，供客户端 useActionState 展示错误（练习点①）──
export async function createTodo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const title = String(formData.get('title') || '').trim()
    if (!title) return { ok: false, error: '标题不能为空' }
    const { base, hd } = await buildBase()
    const res = await fetch(`${base}/api/todo`, {
      method: 'POST',
      headers: hd,
      body: JSON.stringify({ title, done: false }),
    })
    const st = await handle(res)
    if (!st.ok) return st
    revalidateTag('todos') // 练习点③：按标签精确失效，而非整页
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || '创建异常' }
  }
}

// ── 改标题：行内编辑用 ──
export async function updateTodo(id: number, formData: FormData): Promise<ActionState> {
  try {
    const title = String(formData.get('title') || '').trim()
    if (!title) return { ok: false, error: '标题不能为空' }
    const { base, hd } = await buildBase()
    const res = await fetch(`${base}/api/todo/${id}`, {
      method: 'PATCH',
      headers: hd,
      body: JSON.stringify({ title }),
    })
    const st = await handle(res)
    if (!st.ok) return st
    revalidateTag('todos')
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || '更新异常' }
  }
}

// ── 改完成态：PATCH done ──
export async function toggleTodo(id: number, done: boolean) {
  try {
    const { base, hd } = await buildBase()
    await fetch(`${base}/api/todo/${id}`, {
      method: 'PATCH',
      headers: hd,
      body: JSON.stringify({ done }),
    })
    revalidateTag('todos')
  } catch {
    // toggle 失败不易在行内提示，可在此埋点
  }
}

// ── 删 ──
export async function deleteTodo(id: number) {
  try {
    const { base, hd } = await buildBase()
    await fetch(`${base}/api/todo/${id}`, { method: 'DELETE', headers: hd })
    revalidateTag('todos')
  } catch {
    // 同上
  }
}

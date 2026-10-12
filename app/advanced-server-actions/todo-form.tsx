'use client'

import { useActionState } from 'react'
import { createTodo, type ActionState } from './actions'
import SubmitButton from './submit-button'

export default function TodoForm() {
  // 练习点①：useActionState 捕获 action 返回的 {ok, error}，失败时表单直接提示
  const [state, formAction] = useActionState<ActionState, FormData>(createTodo, { ok: true })
  return (
    <form action={formAction} className="space-y-2">
      <input name="title" placeholder="待办标题" className="w-full rounded border px-2 py-1" />
      <SubmitButton className="rounded bg-blue-600 px-3 py-1 text-white">新增</SubmitButton>
      {!state.ok && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  )
}

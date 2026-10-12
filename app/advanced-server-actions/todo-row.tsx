'use client'

import { useState, useActionState } from 'react'
import { updateTodo, deleteTodo, toggleTodo, type ActionState } from './actions'
import SubmitButton from './submit-button'
import type { Todo } from './types'

export default function TodoRow({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false)
  // 行内编辑：把 id 闭包进 action，错误同样用 useActionState 提示
  const [editState, editAction] = useActionState<ActionState, FormData>(
    (_prev, fd) => updateTodo(todo.id, fd),
    { ok: true },
  )

  if (editing) {
    return (
      <li className="flex flex-col gap-1 border-b py-1">
        <form action={editAction} className="flex flex-1 items-center gap-2">
          <input
            name="title"
            defaultValue={todo.title}
            className="flex-1 rounded border px-2 py-1"
            autoFocus
          />
          <SubmitButton className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white">
            保存
          </SubmitButton>
          <button
            type="button"
            className="rounded border px-2 py-0.5 text-xs"
            onClick={() => setEditing(false)}
          >
            取消
          </button>
        </form>
        {!editState.ok && <p className="text-xs text-red-600">{editState.error}</p>}
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-2 border-b py-1">
      <span className={todo.done ? 'line-through text-gray-400' : ''}>
        #{todo.id} {todo.title} {todo.done ? '✅' : ''}
      </span>
      <span className="flex shrink-0 gap-1">
        {/* 练习点②：useFormStatus 提交中…；bind 把 id/done 预置进 server action */}
        <form action={toggleTodo.bind(null, todo.id, !todo.done)}>
          <SubmitButton className="rounded border px-2 py-0.5 text-xs">
            {todo.done ? '↩ 未完成' : '✅ 完成'}
          </SubmitButton>
        </form>
        <button
          type="button"
          className="rounded border px-2 py-0.5 text-xs"
          onClick={() => setEditing(true)}
        >
          改
        </button>
        <form action={deleteTodo.bind(null, todo.id)}>
          <SubmitButton className="rounded border px-2 py-0.5 text-xs text-red-600">
            删
          </SubmitButton>
        </form>
      </span>
    </li>
  )
}

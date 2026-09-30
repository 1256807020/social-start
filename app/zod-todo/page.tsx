'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { todoSchema, TodoForm } from './schema'

export default function ZodTodoPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoForm>({
    // 👉 接上 zod 校验器
    resolver: zodResolver(todoSchema),
  })

  const [todos, setTodos] = useState<{ id: number; text: string }[]>([])

  // 👉 提交：校验通过后把 data.text 加入列表，再 reset() 清空表单
  const onSubmit = (data: TodoForm) => {
    // setTodos((list) => [...list, { id: Date.now(), text: data.text }])
    // reset()
  }

  // 👉 删：setTodos 过滤掉 id（改可再加编辑态，留给你练）
  const handleRemove = (id: number) => {
    // setTodos((list) => list.filter((x) => x.id !== id))
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>
        Zod + react-hook-form Todo <small>（learn/zod-todo）</small>
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('text')}
          placeholder="👉 输入 todo（校验：非空、≤50 字）"
        />
        <button type="submit">添加</button>
      </form>

      {/* 👉 校验错误信息：errors.text?.message */}
      {errors.text && <p style={{ color: 'red' }}>{errors.text.message}</p>}

      <ul>
        {todos.map((t) => (
          <li
            key={t.id}
            style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}
          >
            <span style={{ flex: 1 }}>{t.text}</span>
            <button onClick={() => handleRemove(t.id)}>删除</button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p>👉 列表空，添加一条试试（留空或超长会触发 zod 校验报错）</p>
      )}
    </main>
  )
}

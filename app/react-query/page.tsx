'use client'

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * TanStack Query：服务端状态管理（搬运自 ReactAdm03）
 * 用基座自带的 /api/todo 当后端（零改动）。
 * 练习前先：pnpm add @tanstack/react-query
 * 每个 👉 是给你手敲的练习点。
 */
const queryClient = new QueryClient()

async function fetchTodos(): Promise<{ id: number; title: string }[]> {
  const res = await fetch('/api/todo')
  // 👉 检查 res.ok，返回 JSON 数组
  return res.json()
}

function TodoList() {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos, // 👉 手敲 queryFn
  })

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      // 👉 POST /api/todo，body: JSON.stringify({ title })
      await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }), // 👉 成功后让列表重新拉取
  })

  if (isLoading) return <p>加载中…</p>
  if (isError) return <p>出错了</p>
  return (
    <div>
      <button onClick={() => addMutation.mutate('新待办')} disabled={addMutation.isPending}>
        {addMutation.isPending ? '添加中…' : '新增'}
      </button>
      <ul>
        {data?.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default function ReactQueryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
        <h1>TanStack Query · /api/todo</h1>
        <TodoList />
      </main>
    </QueryClientProvider>
  )
}

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（UI 库篇）· Chakra UI（基于 emotion 的组件库）
// · Vue2 对照：组件库思路同 element-ui / ant-design-vue ——「开箱即用组件 + 主题变量」；Chakra 的 props 风格 ≈ Vue 的组件 attr；
// · Vue3 对照：同上，国内常用 element-plus；Chakra 在 React 侧定位类似「自带设计系统的组件库」；
// · React 对照：ChakraProvider 包住全局，组件用 props 控制样式（colorScheme / as），本例 CRUD 走 /api/todo。
// 📌 实战定位：组件库【了解即可·进阶】；你已熟 antd / mantle / shadcn，Chakra 作为「另一流派」认领即可，不必深练。
// 🧭 学习模式：🔧固定写法=ChakraProvider 包裹 + 组件 props 控制；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

// 【Chakra UI 分支 · learn/chakra-ui】
// 演示：Chakra UI v2 组件库（国际主流 UI 之一，基于 emotion）。ChakraProvider 包住业务。
// 业务：复用 /api/todo 做增删改查。
import { useEffect, useState } from 'react'
import {
  ChakraProvider,
  Box,
  Heading,
  Input,
  Button,
  Checkbox,
  List,
  ListItem,
  HStack,
  Text,
  Container,
  useToast,
} from '@chakra-ui/react'

type Todo = { id: number; title: string; done: boolean }
const PAGE_SIZE = 8

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)
  const toast = useToast()

  const load = async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${PAGE_SIZE}&sort=-id`)
    const j = await r.json()
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }

  useEffect(() => {
    load(1)
  }, [])

  const add = async () => {
    if (!title.trim()) return
    await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false }),
    })
    setTitle('')
    load(page)
    toast({ title: '已新增', status: 'success', duration: 1500 })
  }

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

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <Container maxW="3xl" py={8}>
      <Heading size="lg" mb={4}>Chakra UI · todo CRUD · app/chakra-ui</Heading>
      <Text fontSize="sm" color="gray.500" mb={4}>国际主流组件库（基于 emotion）。下方 CRUD 复用 /api/todo。</Text>

      <HStack mb={4}>
        <Input placeholder="新待办标题" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button colorScheme="blue" onClick={add}>新增</Button>
        <Button variant="outline" onClick={() => load(page)}>刷新</Button>
      </HStack>

      <List spacing={2}>
        {todos.map((t) => (
          <ListItem key={t.id} borderBottomWidth="1px" py={1}>
            <HStack>
              <Checkbox isChecked={!!t.done} onChange={() => patch(t.id, { done: !t.done })} />
              {editing?.id === t.id ? (
                <Input
                  size="sm"
                  value={editing.title}
                  onChange={(e) => setEditing({ id: t.id, title: e.target.value })}
                  onBlur={() => {
                    patch(t.id, { title: editing.title })
                    setEditing(null)
                  }}
                />
              ) : (
                <Text flex="1" as={t.done ? 'del' : 'span'} onDoubleClick={() => setEditing({ id: t.id, title: t.title })}>
                  #{t.id} {t.title}
                </Text>
              )}
              <Button size="xs" colorScheme="blue" variant="link" onClick={() => setEditing({ id: t.id, title: t.title })}>改</Button>
              <Button size="xs" colorScheme="red" variant="link" onClick={() => remove(t.id)}>删</Button>
            </HStack>
          </ListItem>
        ))}
      </List>

      <HStack justify="space-between" mt={4}>
        <Button size="sm" disabled={page <= 1} onClick={() => load(page - 1)}>上一页</Button>
        <Text fontSize="sm">{page} / {totalPages}（共 {total}）</Text>
        <Button size="sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>下一页</Button>
      </HStack>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">组件库流派</td><td className="px-2 py-1">element-ui / ant-design-vue / element-plus</td><td className="px-2 py-1">Chakra UI（本例）/ antd / shadcn</td></tr>
            <tr className="border-b"><td className="px-2 py-1">样式控制</td><td className="px-2 py-1">组件 attr + css</td><td className="px-2 py-1">组件 props（colorScheme / as）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">主题</td><td className="px-2 py-1">主题变量 / CSS 变量</td><td className="px-2 py-1">theme 对象 + extend</td></tr>
            <tr className="border-b"><td className="px-2 py-1">定位</td><td className="px-2 py-1">国内主流</td><td className="px-2 py-1">国际主流（emotion 体系）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：同一后台需求不同 UI 库写法不同；本例 CRUD 全部走 /api/todo 真实接口。</p>
      </details>
    </Container>
  )
}

export default function ChakraUiPage() {
  return (
    <ChakraProvider>
      <Box bg="gray.50" minH="100vh">
        <TodoApp />
      </Box>
    </ChakraProvider>
  )
}

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

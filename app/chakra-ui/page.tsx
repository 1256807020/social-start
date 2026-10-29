// ───────────────────────────────────────────────────────────
// 【learn/chakra-ui】Chakra UI 组件库实战（§16 页头三段式）
//
// 1) 一句话定位
//    React 侧「自带设计系统、用 props 驱动样式」的组件库流派代表作；本支在
//    ChakraProvider 包裹下用 /api/todo 跑通一套 CRUD。
//    （Vue 语境对照：相当于 React 版的 element-plus / ant-design-vue —— 开箱即用组件 + 主题变量）
//
// 2) 关键 API / 钩子（记住这几个就够）
//    · ChakraProvider  全局包裹，提供主题与样式上下文
//    · <Box>/<Container>/<Stack> 布局原语，用 props 控制间距/对齐（替代手写 CSS）
//    · <Input>/<Button>/<Checkbox> 表单组件，colorScheme 一键换主题色
//    · useToast        轻量全局提示
//    · 数据层 fetch('/api/todo') 走 basic 真接口（禁止直读 data/*.json、禁止自造 route.ts/store）
//
// 3) 适用场景（什么时候用 / 替代什么）
//    · 想要开箱即用 + 自带设计系统 + props 控样式的 React 项目
//    · 与已学 antd / MUI / shadcn / Mantine 同属组件库流派；你已熟前三者，
//      本支作「另一流派」认领即可（难度：了解即可·进阶，不必深练）
// ───────────────────────────────────────────────────────────
'use client'

// 【Chakra UI 分支 · learn/chakra-ui】业务：复用 /api/todo 做增删改查（照 basic 范本，不直读 data/*.json）
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

// 数据形状与 basic 的 /api/todo 契约一致（id/title/done）；PAGE_SIZE 控制每页条数
type Todo = { id: number; title: string; done: boolean }
const PAGE_SIZE = 8

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)
  // useToast 固定用法：Chakra 钩子，必须在 <ChakraProvider> 内部组件里调用
  const toast = useToast()

  // 取数：分页拉 /api/todo（sort=-id 最新在前），复用 basic 真接口，绝不直读 data/*.json
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

  // 新增：POST /api/todo 后刷新当前页，useToast 给轻量反馈
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

  // 改：PATCH /api/todo/:id（done 切换 / 标题编辑都走这里）
  const patch = async (id: number, p: Partial<Todo>) => {
    await fetch(`/api/todo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
    load(page)
  }

  // 删：DELETE /api/todo/:id
  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    load(page)
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1) // 至少 1 页，避免 0 页/负数

  // 页面骨架：Container 居中定宽容器；Heading 标题；Text 一句说明
  return (
    <Container maxW="3xl" py={8}>
      <Heading size="lg" mb={4}>Chakra UI · todo CRUD · app/chakra-ui</Heading>
      <Text fontSize="sm" color="gray.500" mb={4}>国际主流组件库（基于 emotion）。下方 CRUD 复用 /api/todo。</Text>

      {/* 表单区：<Input>/<Button> 都是 Chakra 组件；colorScheme 一键套主题色（固定写法），onKeyDown 支持回车提交 */}
      <HStack mb={4}>
        <Input placeholder="新待办标题" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button colorScheme="blue" onClick={add}>新增</Button>
        <Button variant="outline" onClick={() => load(page)}>刷新</Button>
      </HStack>

      {/* 列表渲染：每条 done 用 Checkbox 切换，标题双击进入编辑态 */}
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

      {/* 分页：上一页 / 下一页 + 总数，边界禁用 */}
      <HStack justify="space-between" mt={4}>
        <Button size="sm" disabled={page <= 1} onClick={() => load(page - 1)}>上一页</Button>
        <Text fontSize="sm">{page} / {totalPages}（共 {total}）</Text>
        <Button size="sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>下一页</Button>
      </HStack>

      {/* ── 文末三对比（§16 强制）：Chakra UI vs 替代方案 antd vs shadcn ── */}
      <Box mt={8} p={4} borderWidth="1px" borderRadius="md">
        <Heading size="sm" mb={3}>📊 技术选型：React 组件库三向对比</Heading>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1 text-left">维度</th>
              <th className="px-2 py-1 text-left">Chakra UI（本例）</th>
              <th className="px-2 py-1 text-left">antd</th>
              <th className="px-2 py-1 text-left">shadcn/ui</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">样式驱动</td><td className="px-2 py-1">props（colorScheme / as）</td><td className="px-2 py-1">className + 主题 token</td><td className="px-2 py-1">Tailwind 原子类 + 复制源码</td></tr>
            <tr className="border-b"><td className="px-2 py-1">底层</td><td className="px-2 py-1">emotion（CSS-in-JS）</td><td className="px-2 py-1">CSS-in-JS（内部）</td><td className="px-2 py-1">无运行时，纯 Tailwind</td></tr>
            <tr className="border-b"><td className="px-2 py-1">定制方式</td><td className="px-2 py-1">theme.extend 全局主题</td><td className="px-2 py-1">ConfigProvider 换主题</td><td className="px-2 py-1">直接改 components 源码</td></tr>
            <tr className="border-b"><td className="px-2 py-1">后台模板</td><td className="px-2 py-1">需自己拼（无官方 admin）</td><td className="px-2 py-1">ProComponents 齐活</td><td className="px-2 py-1">需自行搭（常配 Next/Admin）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">适合</td><td className="px-2 py-1">props 控样式、快出活</td><td className="px-2 py-1">中后台全家桶</td><td className="px-2 py-1">要完全掌控样式/轻量</td></tr>
          </tbody>
        </table>
        <Text fontSize="xs" color="gray.500" mt={2}>同流派还有 MUI / Mantine（本仓库 admin-mui、admin-mantine 已演示）。组件库挑一支深用即可，不必全学。</Text>
      </Box>

      {/* 补充：跨框架对照（Vue 用户友好版） */}
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

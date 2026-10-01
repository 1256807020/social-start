// 【tRPC 分支 · learn/trpc】服务端 router
// 类型安全全栈 API：前后端共享 AppRouter 类型，客户端调用即带完整 TS 提示。
// 存储复用本项目的 JSON 引擎（lib/json-db + lib/query），操作 todo 集合。
import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { read, transaction, genId } from '../json-db'
import { applyQuery } from '../query'

const t = initTRPC.create()
export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  // 列表（带分页/排序，复用 applyQuery）
  todoList: publicProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(8), sort: z.string().optional() }))
    .query(async ({ input }) => {
      const list = await read('todo')
      return applyQuery(list, { page: input.page, pageSize: input.pageSize, sort: input.sort ?? '-id' })
    }),

  // 新增
  todoAdd: publicProcedure
    .input(z.object({ title: z.string().min(1), done: z.boolean().default(false) }))
    .mutation(async ({ input }) => {
      return transaction('todo', (list) => {
        const id = genId(new Set(list.map((i) => String(i.id))))
        const item = { id, title: input.title, done: input.done, createdAt: new Date().toISOString() }
        list.unshift(item)
        return item
      })
    }),

  // 局部更新（增量合并，等价于 PATCH）
  todoPatch: publicProcedure
    .input(z.object({ id: z.number(), patch: z.record(z.any()) }))
    .mutation(async ({ input }) => {
      return transaction('todo', (list) => {
        const i = list.findIndex((x) => String(x.id) === String(input.id))
        if (i === -1) return null
        list[i] = { ...list[i], ...input.patch }
        return list[i]
      })
    }),

  // 删除
  todoRemove: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return transaction('todo', (list) => {
      const i = list.findIndex((x) => String(x.id) === String(input.id))
      if (i !== -1) list.splice(i, 1)
      return { ok: true }
    })
  }),
})

export type AppRouter = typeof appRouter

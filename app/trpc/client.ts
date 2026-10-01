'use client'

// tRPC 客户端实例（createTRPCReact 生成带类型的 hooks：trpc.todoList.useQuery ...）
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../lib/trpc/router'

export const trpc = createTRPCReact<AppRouter>()

// tRPC 在 Next.js App Router 的入口：用 fetch adapter 承接 /api/trpc/* 请求
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../../../lib/trpc/router'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }

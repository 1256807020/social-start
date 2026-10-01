// 【Auth.js 分支 · learn/authjs】服务端配置（Auth.js v5 / next-auth beta，适配 App Router）
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// 演示用：写死一个账号 admin / 123456。真实项目应查库 + 加密比对。
export const { handlers, auth, signIn, signOut } = NextAuth({
  // 生产务必用环境变量 AUTH_SECRET；这里给开发兜底值
  secret: process.env.AUTH_SECRET || 'dev-secret-change-me',
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      authorize: async (c) => {
        if (c?.username === 'admin' && c?.password === '123456') {
          return { id: '1', name: 'admin', email: 'admin@example.com' }
        }
        return null
      },
    }),
  ],
})

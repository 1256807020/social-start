// 【next-server-only · 服务端专用模块】app/next-server-only/secret.ts
// 🔧 固定写法：文件顶部 import 'server-only'。
//    效果：这个模块<strong>一旦被客户端组件 import，直接在构建期报错</strong>，
//    而不是等到线上才发现「数据库密码被打包进浏览器 JS 里」—— 这是它唯一的、但极重要的价值。
import 'server-only'

// 模拟「只能在服务端做」的事：读环境变量、连数据库、读文件系统。
// 这些一旦进客户端 bundle，就是严重的安全事故（密钥泄露）。
export function getServerSecret() {
  return {
    dbHost: process.env.DB_HOST ?? 'localhost（未设置）',
    dbUser: process.env.DB_USER ?? 'root（未设置）',
    // 真实项目里这里会是 process.env.DB_PASSWORD —— 绝不能出现在浏览器
    hasPassword: Boolean(process.env.DB_PASSWORD),
    readAt: new Date().toLocaleTimeString('zh-CN'),
  }
}

export type ServerSecret = ReturnType<typeof getServerSecret>

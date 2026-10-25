// 【next-redirect · 永久重定向 308】app/next-redirect/legacy/page.tsx
// 🔧 固定写法：permanentRedirect 与 redirect 用法完全一样，只是状态码不同：
//    redirect → 307（临时）      permanentRedirect → 308（永久）
//    搜索引擎看到 308 会把权重转移到新地址 —— 站点改版/换域名时用它。
import { permanentRedirect } from 'next/navigation'

export default function LegacyPage() {
  permanentRedirect('/next-redirect/new')
}

// 【next-convention-files · 触发 404】app/next-convention-files/missing/page.tsx
// 🔧 固定写法：数据不存在时调用 notFound()，
//    它会去找<strong>最近的</strong> not-found.tsx 并渲染（这里就是 ../not-found.tsx）。
import { notFound } from 'next/navigation'

export default function MissingPage() {
  notFound()
}

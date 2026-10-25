// 【next-parallel-routes · @stats 兜底】app/next-parallel-routes/@stats/default.tsx
// 🔧 固定写法（关键）：每个具名插槽都必须有 default.tsx。
//    原因：硬刷新或直达某个子路由时，插槽可能匹配不到任何 page，
//    没有 default.tsx 就会 404 —— 这是平行路由最常见的坑。
//    兜底可以直接复用 page 的内容。
export { default } from './page'

// 【next-parallel-routes · children 插槽兜底】app/next-parallel-routes/default.tsx
// 🔧 固定写法：用了平行路由后，children 这个隐式插槽也建议给一个 default.tsx。
//    什么时候用？当 URL 命中了某个插槽的子路由、但 children 没有对应页面时，
//    Next 会渲染 default.tsx 顶上，避免出现空白或 404。
//    这里简单复用主页面内容即可。
export { default } from './page'

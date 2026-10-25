// 【next-intercepting-routes · @modal 兜底】app/next-intercepting-routes/@modal/default.tsx
// 🔧 固定写法（关键）：没有正在被拦截的路由时，插槽返回 null —— 即「不显示弹层」。
//    硬刷新 /photo/1 时走的就是这里：弹层不出现，背景 children 显示真实完整页。
export default function ModalDefault() {
  return null
}

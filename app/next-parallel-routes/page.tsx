// 【next-parallel-routes · 主插槽内容】app/next-parallel-routes/page.tsx
// 这是 children（隐式主插槽）的默认页面：URL /next-parallel-routes 匹配到的就是它。
// 它和 @stats / @recent 是「同时渲染」的关系，不是「子页面」关系。
export default function ParallelHome() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">主区内容（立即出现）</h3>
      <p className="text-sm text-gray-600">
        主插槽是同步渲染的，打开页面立刻可见。右侧两个插槽各自异步取数：
        <code>@stats</code> 很快，<code>@recent</code> 故意慢 2 秒。
      </p>
      <p className="text-sm text-gray-600">
        观察点：慢的 <code>@recent</code> 会先显示自己的 <code>loading.tsx</code>（骨架屏），
        而主区和 <code>@stats</code> 早已渲染完成 —— 这就是「各数据域独立加载」。
      </p>
    </div>
  )
}

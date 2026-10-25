// 【next-router-methods · useRouter 六方法】app/next-router-methods/page.tsx
// 从 Vue 转 React（路由篇）：
//   Vue 用 this.$router / useRouter()（vue-router）：push / replace / go(n) / back / forward。
//   Next 的 useRouter 多出一个<strong>Vue 没有的 refresh()</strong>：
//   它重新向服务端请求「本路由的服务端组件」，用来拿到最新数据，
//   但<strong>不会</strong>丢掉当前客户端组件的 state —— 这是 RSC 架构下特有的能力。
//   另外 Vue 的 go(1)/go(-1) 在 Next 里就是 forward()/back()。
import RouterButtons from './buttons'

// 这是服务端渲染出来的时间：点 refresh 会变，用来直观证明「服务端组件被重新执行了」
export default function RouterMethodsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">useRouter 六方法 · /next-router-methods</h1>
        <p className="text-sm text-gray-500">
          来自 <code>next/navigation</code>：push / replace / back / forward / refresh / prefetch。
        </p>
      </header>

      {/* 服务端时间：refresh 后会更新 */}
      <section className="rounded border bg-sky-50 p-3 text-sm">
        <span className="text-gray-600">服务端渲染时间：</span>
        <strong className="font-mono">{new Date().toLocaleTimeString('zh-CN')}</strong>
        <p className="mt-1 text-xs text-gray-500">
          点下面的 <code>refresh</code>，这个时间会变 —— 说明服务端组件被重新执行了；
          但按钮下面的操作日志（客户端 state）<strong>不会</strong>被清空。
        </p>
      </section>

      <RouterButtons />

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">六个方法对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">Next（useRouter）</th>
              <th className="px-2 py-1">Vue Router</th>
              <th className="px-2 py-1">作用</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">push(href)</td>
              <td className="px-2 py-1">router.push</td>
              <td className="px-2 py-1">新增历史记录，可后退</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">replace(href)</td>
              <td className="px-2 py-1">router.replace</td>
              <td className="px-2 py-1">替换当前记录</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">back()</td>
              <td className="px-2 py-1">router.go(-1) / back</td>
              <td className="px-2 py-1">后退</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">forward()</td>
              <td className="px-2 py-1">router.go(1) / forward</td>
              <td className="px-2 py-1">前进</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">refresh()</td>
              <td className="px-2 py-1">❌ 无对应</td>
              <td className="px-2 py-1">重取服务端数据，保留客户端 state</td>
            </tr>
            <tr>
              <td className="px-2 py-1">prefetch(href)</td>
              <td className="px-2 py-1">❌ 无内置</td>
              <td className="px-2 py-1">手动预取路由</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          两个易错点：① 必须 <code>import {'{ useRouter }'} from &apos;next/navigation&apos;</code>，
          写成 <code>next/router</code> 是旧 Pages Router 的 API，App Router 下会报错；
          ② <code>refresh()</code> 常配合 <code>startTransition</code> 使用，避免刷新时页面卡住。
        </p>
      </details>
    </main>
  )
}

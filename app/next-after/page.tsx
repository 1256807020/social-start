// 【next-after · after() 响应后回调】app/next-after/page.tsx
// 从 Vue 转 React（服务端篇）：
//   Vue/Nuxt 没有直接对应的 API。Nuxt 里要做「响应后任务」通常靠 Nitro 插件的
//   render:response 钩子，或干脆放到客户端埋点（等页面加载完再上报）。
//   Next 的 after() 把这件事标准化了：<strong>注册一个「响应发完之后再跑」的回调</strong>。
// 实战定位：埋点上报、访问日志、慢查询告警、缓存预热 ——
//   这些都不该让用户多等一毫秒，以前会拖慢响应，现在可以挪到 after() 里。
// 学习模式：🔧 固定写法 = import { after } from 'next/server' → after(() => {...})；
//          👉 练习点 = 在 after 里写一个「耗时 2 秒」的任务，对比页面返回有没有变慢。
import { after } from 'next/server'

export default function AfterPage() {
  const renderStart = Date.now()

  // 🔧 固定写法：after() 里的代码会在「响应发送给用户之后」才执行，
  //    所以它的耗时不会体现在用户的等待时间里。
  after(() => {
    // 真实场景：写日志、上报埋点、发告警
    console.log(
      `[after] 响应已发送，现在才执行这个回调；页面渲染耗时约 ${Date.now() - renderStart}ms`,
    )
  })

  // 再来一个：模拟一个很慢的「收尾任务」
  after(async () => {
    await new Promise((r) => setTimeout(r, 2000))
    console.log('[after] 慢任务（2 秒）完成 —— 但用户早就拿到页面了')
  })

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">after() 响应后回调 · /next-after</h1>
        <p className="text-sm text-gray-500">
          把「不影响页面内容」的收尾任务挪到响应之后执行，用户不用等。
        </p>
      </header>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">怎么观察效果？</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>本页注册了一个<strong>耗时 2 秒</strong>的 after 任务。</li>
          <li>
            刷新页面：页面<strong>立刻</strong>就出来了（不会被那 2 秒拖住）。
          </li>
          <li>
            然后看运行 <code>pnpm dev</code> 的终端：大约 2 秒后才会打印
            <code>[after] 慢任务（2 秒）完成</code> —— 证明它是在响应之后跑的。
          </li>
        </ol>
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">能用在哪些地方</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>服务端组件（本页）</li>
          <li>Server Action</li>
          <li>Route Handler（见 <code>/next-after/api</code>）</li>
        </ul>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">注意事项 + 总结</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            <strong>不能改响应</strong>：after() 跑的时候响应已经发出去了，
            在里面写 header / set cookie 都没有意义。
          </li>
          <li>
            <strong>它不影响页面输出</strong>：适合「副作用」——日志、埋点、告警、缓存预热。
          </li>
          <li>
            <strong>不要放必须成功的业务逻辑</strong>：比如「发欢迎邮件」放这里，
            进程被回收就可能丢（那种该走队列）。
          </li>
          <li>
            对比：<code>connection()</code> 是「等到请求再算」，
            <code>after()</code> 是「响应之后再算」—— 一个在前一个在后。
          </li>
        </ul>
      </details>
    </main>
  )
}

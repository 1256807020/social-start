// 【next-script · 被加载的第三方脚本示例】public/next-script-demo.js
// 放在 public/ 下就能以 /next-script-demo.js 访问。
// 这里模拟「第三方统计/地图/客服插件」：加载后往 window 上挂一个对象并打日志。
(function () {
  window.__NextScriptDemo = {
    loadedAt: new Date().toLocaleTimeString('zh-CN'),
    hello: function () {
      return '第三方脚本已就绪'
    },
  }
  console.log('[next-script-demo] 已加载 @', window.__NextScriptDemo.loadedAt)
})()

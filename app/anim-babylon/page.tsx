// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·3D 引擎篇）· Babylon.js
// · Vue2/Vue3 对照：Babylon.js 框架无关，Vue 里同样 onMounted 建 Engine/Scene、onUnmounted dispose；写法与 React 一致。
// · React 对照：useRef 拿 <canvas>，useEffect 里 new BABYLON.Engine + Scene + 渲染循环，卸载 engine.dispose()（本例）。
// 📌 实战定位：重型 3D / XR【了解即可·进阶】；微软背书的全能引擎，内置物理/音频/XR，适合沉浸式 VR/AR 与重度 3D 交互。
// 🧭 学习模式：🔧固定写法=new Engine(canvas) → new Scene → ArcRotateCamera → MeshBuilder.CreateX → runRenderLoop；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useEffect, useRef } from 'react'
import * as BABYLON from 'babylonjs'
// 练习前在本分支运行：pnpm add babylonjs

export default function BabylonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new BABYLON.Engine(canvas, true) // 👉 第二个参数=抗锯齿
    const scene = new BABYLON.Scene(engine)

    // 👉 轨道相机：拖拽旋转、滚轮缩放
    const camera = new BABYLON.ArcRotateCamera('cam', Math.PI / 3, Math.PI / 3, 6, BABYLON.Vector3.Zero(), scene)
    camera.attachControl(canvas, true)

    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene)

    const box = BABYLON.MeshBuilder.CreateBox('box', { size: 1.6 }, scene)
    const mat = new BABYLON.StandardMaterial('mat', scene)
    mat.diffuseColor = new BABYLON.Color3(0.3, 0.8, 0.5) // 👉 漫反射颜色
    box.material = mat

    engine.runRenderLoop(() => scene.render()) // 👉 每帧渲染
    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose() // 👉 务必释放 GPU 资源
    }
  }, [])

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Babylon.js 基础 3D 引擎</h1>
      <p>命令式 3D 引擎：建 Engine/Scene/相机/网格，渲染循环驱动；比 R3F 更偏「手写场景图」。</p>
      <canvas ref={canvasRef} style={{ width: '100%', height: 420, background: '#0b1020', borderRadius: 8 }} />
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">入口</td><td className="px-2 py-1">onMounted</td><td className="px-2 py-1">useEffect</td></tr>
            <tr className="border-b"><td className="px-2 py-1">引擎</td><td className="px-2 py-1">new Engine(canvas)</td><td className="px-2 py-1">new Engine(canvas)（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">清理</td><td className="px-2 py-1">onUnmounted dispose</td><td className="px-2 py-1">useEffect 清理 dispose</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Babylon 是命令式全能引擎（物理/音频/XR 内置），R3F 是声明式封装；React 侧二选一，重交互选 Babylon、组件化选 R3F。</p>
      </details>
    </main>
  )
}

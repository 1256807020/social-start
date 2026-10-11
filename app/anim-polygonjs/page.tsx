// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·低多边形创意 3D 篇）· Polygonjs
// · Vue2/Vue3 对照：Polygonjs 是框架无关的「节点编辑器」，导出的场景本质是 Three.js；在 Vue 里同样用 Three.js 渲染其产物。
// · React 对照：Polygonjs 编译产物 = Three.js 场景，所以 React 侧直接用 R3F 复刻其「低多边形创意 3D」效果最顺手（本例）。
// 📌 实战定位：低多边形创意 3D【了解即可·进阶】；Polygonjs 让你在浏览器里可视化搭节点生成 Three.js 场景，快速做低多边形风格交互。
// 🧭 学习模式：🔧固定写法=低多边形审美 = flatShading + 少面数几何（icosahedron/torusKnot）+ 自转；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
// 练习前在本分支运行：pnpm add three @react-three/fiber @react-three/drei
//   （Polygonjs 本身：pnpm add @polygonjs/polygonjs；它是节点编辑器，产物即 Three.js，React 侧用 R3F 承接最顺）

function LowPoly() {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4 // 👉 自转
      ref.current.rotation.x += delta * 0.15
    }
  })
  return (
    <mesh ref={ref}>
      {/* 👉 少面数二十面体 + 平面着色 = 低多边形质感 */}
      <icosahedronGeometry args={[1.6, 1]} />
      <meshStandardMaterial color="#f4a259" flatShading />
    </mesh>
  )
}

export default function PolygonjsPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Polygonjs 低多边形创意 3D</h1>
      <p>Polygonjs 是节点化的 Three.js 搭建工具；其低多边形审美在 React 侧用 R3F（少面数 + flatShading）即可低成本复刻。</p>
      <div style={{ width: '100%', height: 420, background: '#0b1020', borderRadius: 8 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 4, 4]} intensity={1.1} />
          <LowPoly />
          <OrbitControls />
        </Canvas>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">Polygonjs 产物</td><td className="px-2 py-1">Three.js 场景</td><td className="px-2 py-1">R3F 场景（等价）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">低多边形</td><td className="px-2 py-1">flatShading + 少面</td><td className="px-2 py-1">flatShading + 少面（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">搭建方式</td><td className="px-2 py-1">节点编辑器</td><td className="px-2 py-1">代码（R3F JSX）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Polygonjs 解决「可视化搭场景」，React 侧用 R3F 写等价场景即可；想用 Polygonjs 编辑器就 import 其产物 JSON 进 R3F 渲染。</p>
      </details>
    </main>
  )
}

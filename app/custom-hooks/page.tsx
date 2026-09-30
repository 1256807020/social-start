'use client'

import { useState, useEffect } from 'react'

/**
 * 自定义 Hook 合集（搬运自 learning-demos）
 *  useLocalStorage —— 同步 localStorage 的状态
 *  useMousePosition —— 跟踪鼠标坐标
 *  useFetch —— 通用数据请求（loading/error/data）
 * 每个 👉 是给你手敲的练习点。
 */

// 👉 手敲：useLocalStorage<T>(key, initial) 返回 [value, setValue]，并在写入时同步 localStorage
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    // 👉 读取 localStorage.getItem(key)，解析失败回退 initial
    return initial
  })
  useEffect(() => {
    // 👉 localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// 👉 手敲：useMousePosition() 返回 { x, y }，监听 mousemove
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    // 👉 const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY }); window.addEventListener('mousemove', onMove); return () => removeEventListener
  }, [])
  return pos
}

// 👉 手敲：useFetch<T>(url) 返回 { data, loading, error }
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    // 👉 fetch(url).then(r=>r.json()).then(setData).catch(setError).finally(()=>setLoading(false))
  }, [url])
  return { data, loading, error }
}

export default function CustomHooksPage() {
  const [name, setName] = useLocalStorage('name', '游客')
  const pos = useMousePosition()
  const { data, loading } = useFetch<{ id: number; title: string }[]>('/api/todo')
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>自定义 Hook</h1>
      <section>
        <h2>① useLocalStorage</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <p>存到 localStorage 的 name：{name}</p>
      </section>
      <section>
        <h2>② useMousePosition</h2>
        <p>鼠标：{pos.x}, {pos.y}</p>
      </section>
      <section>
        <h2>③ useFetch（/api/todo）</h2>
        <p>{loading ? '加载中…' : `拿到 ${data?.length ?? 0} 条`}</p>
      </section>
    </main>
  )
}

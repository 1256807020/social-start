"use client";

import { useEffect, useState } from "react";

/**
 * 自定义 Hook 合集（搬运自 learning-demos）
 *  useLocalStorage —— 同步 localStorage 的状态
 *  useMousePosition —— 跟踪鼠标坐标
 *  useFetch —— 通用数据请求（loading/error/data）
 * 每个 👉 是给你手敲的练习点。
 *
 * ── React 自定义 Hook ↔ Vue2 / Vue3 对照（先有个底）──
 *  共同点：都是“把一段逻辑（状态 + 副作用）抽成可复用的函数/组合式函数”。
 *  写法差：
 *   · React：用 useState 存状态 + useEffect 跑副作用（挂载/更新/清理）。
 *           清理写在 useEffect 返回的“清理函数”里（return () => 移除监听）。
 *   · Vue3：用 ref/reactive 存状态 + onMounted/onUnmounted 挂卸载监听 + watch 做响应式同步。
 *           Vue 生态另有 VueUse 提供现成的 useStorage / useMouse / useFetch，几乎一行搞定。
 *   · Vue2：无组合式 API，常用 mixins / this.$watch，写法差别较大（下面以 Vue3 为主对照）。
 */

// 👉 手敲：useLocalStorage<T>(key, initial) 返回 [value, setValue]，并在写入时同步 localStorage
// 👉 Vue3 对照（手写）：
//    import { ref, watch } from 'vue'
//    function useLocalStorage(key, initial) {
//      const value = ref(JSON.parse(localStorage.getItem(key) ?? JSON.stringify(initial)))
//      watch(value, v => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
//      return value
//    }
//    VueUse 现成版：const name = useStorage('name', '游客')   ← 相当于本 hook 的成品
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    // 👉 读取 localStorage.getItem(key)，解析失败回退 initial
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initial;
    } catch {
      // 解析炸了（脏数据）就退回初值
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// 👉 手敲：useMousePosition() 返回 { x, y }，监听 mousemove
// 👉 Vue3 对照（手写）：
//    import { ref, onMounted, onUnmounted } from 'vue'
//    function useMousePosition() {
//      const pos = ref({ x: 0, y: 0 })
//      const onMove = (e: MouseEvent) => { pos.value = { x: e.clientX, y: e.clientY } }
//      onMounted(() => window.addEventListener('mousemove', onMove))
//      onUnmounted(() => window.removeEventListener('mousemove', onMove))
//      return pos
//    }
//    VueUse 现成版：const { x, y } = useMouse()
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

// 👉 手敲：useFetch<T>(url) 返回 { data, loading, error }
// 👉 Vue3 对照（手写）：
//    import { ref, onMounted } from 'vue'
//    function useFetch(url) {
//      const data = ref(null), loading = ref(true), error = ref(null)
//      onMounted(() => fetch(url).then(r=>r.json()).then(d=>data.value=d)
//        .catch(e=>error.value=e).finally(()=>loading.value=false))
//      return { data, loading, error }
//    }
//    VueUse 现成版：const { data, isFetching, error } = useFetch(url)
//    Nuxt 版：const { data, pending, error } = await useFetch(url)   ← 框架内置
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  return { data, loading, error };
}

export default function CustomHooksPage() {
  const [name, setName] = useLocalStorage("name", "游客");
  const pos = useMousePosition();
  const { data, loading } = useFetch<{
    code: number;
    data: { id: number; title: string }[];
    msg: string;
    total: number;
  }>("/api/todo");
  console.log(data);
  const list = data ? data.data : [];
  return (
    <main
      style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>自定义 Hook</h1>
      <section>
        <h2>① useLocalStorage</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <p>存到 localStorage 的 name：{name}</p>
      </section>
      <section className="!mt-6">
        <h2>② useMousePosition</h2>
        <p>
          鼠标：{pos.x}, {pos.y}
        </p>
      </section>
      <section className="!mt-6">
        <h2>③ useFetch（/api/todo）</h2>
        <p>{loading ? "加载中…" : `拿到 ${list?.length ?? 0} 条`}</p>
      </section>

      <section className="!mt-8">
        <h2>④ React ↔ Vue3 自定义 Hook 对照速查</h2>
        <p style={{ fontSize: 14, color: "#666" }}>
          核心差异：React 用 <code>useState</code>+<code>useEffect</code>
          （清理写在返回的清理函数里）； Vue3 用 <code>ref</code>+
          <code>onMounted/onUnmounted</code>+<code>watch</code>。Vue 生态有
          VueUse 直接给成品。
        </p>

        <h3 style={{ fontSize: 15 }}>useLocalStorage</h3>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          <code>{`// React（本页 👉 让你手敲）
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(initial)))
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue]
}

// Vue3 手写
const value = ref(JSON.parse(localStorage.getItem(key) ?? JSON.stringify(initial)))
watch(value, v => localStorage.setItem(key, JSON.stringify(v)), { deep: true })

// VueUse 成品
const name = useStorage('name', '游客')`}</code>
        </pre>

        <h3 style={{ fontSize: 15 }}>useMousePosition</h3>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          <code>{`// React（本页 👉 让你手敲）
useEffect(() => {
  const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)  // ← 清理函数
}, [])

// Vue3 手写
onMounted(() => window.addEventListener('mousemove', onMove))
onUnmounted(() => window.removeEventListener('mousemove', onMove))

// VueUse 成品
const { x, y } = useMouse()`}</code>
        </pre>

        <h3 style={{ fontSize: 15 }}>useFetch</h3>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          <code>{`// React（本页 👉 让你手敲）
useEffect(() => {
  fetch(url).then(r => r.json()).then(setData).catch(setError).finally(() => setLoading(false))
}, [url])

// Vue3 手写
onMounted(() => fetch(url).then(r => r.json()).then(d => data.value = d)
  .catch(e => error.value = e).finally(() => loading.value = false))

// VueUse 成品
const { data, isFetching, error } = useFetch(url)
// Nuxt 内置
const { data, pending, error } = await useFetch(url)`}</code>
        </pre>
      </section>
    </main>
  );
}

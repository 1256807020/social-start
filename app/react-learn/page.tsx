"use client";

// ============================================================
// React 手敲练习 · 骨架（worksheet）
// 老师只搭好外壳 + 说明，所有标 👉 的地方由【你】手写完成。
// 完成后：pnpm dev（已在 4000 端口）→ 打开 http://localhost:4000/react-learn
// 接口契约见文件底部注释。
//
// Vue2 老兵类比速记：
//   useState(x)        ≈  data() { return { x } } 里的响应式字段
//   setTitle(v)        ≈  this.x = v（触发重渲染）
//   <input value onChange> ≈  v-model
//   useEffect(fn, [])  ≈  created() / mounted()（依赖为空数组 = 只跑一次）
// ============================================================

import { useEffect, useState, type ReactNode } from "react";
import "./page.css";
export default function ReactLearnPage() {
  // 👉 手敲区 1：声明两个 state
  //   - title: 字符串，绑定输入框
  //   - list:  any[]，保存待办列表
  // 提示：const [title, setTitle] = useState('')
  //       const [list, setList] = useState<any[]>([])

  // 👉 手敲区 2：add 函数
  //   1) 形参 (e: React.FormEvent)，先 e.preventDefault() 阻止表单默认刷新
  //   2) 若 title.trim() 为空直接 return
  //   3) fetch POST /api/todo，headers 带 Content-Type: application/json
  //      body: JSON.stringify({ title, done: false })
  //   4) 解析 resp.json()，把返回的 j.data 用 setList 加到列表【前面】
  //   5) 清空 title（setTitle('')）
  // 提示：const add = async (e: React.FormEvent) => { ... }
  const [title, setTitle] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  // 👉 手敲区 5(改):编辑态——正在编辑哪条的 id,以及输入框里的临时文本
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "done" | "undone">("all");
  const [pageInput, setPageInput] = useState("1"); // 分页输入框的临时值
  const [totalPages, setTotalPages] = useState(1); // 后端返回的总页数
  // 函数组件，箭头函数 + 隐式返回（括号包 JSX，不用写 return）
  const BasicBlueCom = () => (
    // 内联样式：style={{ }}，外层 {} 表示 JS 表达式，内层 {} 是样式对象
    <div style={{ color: "blue" }}>
      <p>BasicBlueCom-函数组件</p>
    </div>
  );
  // 写 React+TS 组件,第一反应就是给 props 写接口/类型
  const BasicColorfulCom = ({
    color = "blue",
    children,
  }: {
    color?: string;
    children?: ReactNode;
  }) => (
    <div style={{ color: color }}>
      <span>BasicColorfulCom color is {color}</span>
      {children}
    </div>
  );
  // 箭头函数里 : Type 写在 => 前面是返回类型,不是参数类型。
  // React+TS 的 props 是"白名单"——类型里写了什么属性,组件才能接什么属性,多传一个 name 都会报"不存在属性"
  const BasicColorComProps = (props: {
    color?: string;
    children?: ReactNode;
    name?: string;
  }) => (
    <div style={{ color: props.color || "blue" }}>
      <span>BasicColorfulComProps color is {props.color || "blue"}</span>
      <span> Component Props name is {props.name}</span>
      {props.children}
    </div>
  );
  const StaticCom = ({ name }: { name: string }) => (
    <div className="learn-page">component name is {name}</div>
  );
  //  在 StrictMode 下组件会渲染两次，itemCounter 会被加 2，结果不可预测
  //  这是 React 严格禁止的写法！副作用应该放在 useEffect 或事件处理函数中
  // let itemCounter = 0;
  // const NoStaticCom = ({ name }: { name: string }) => {
  //   itemCounter++; // ❌ 副作用：修改外部变量，违反纯函数原则
  //   return (
  //     <h1>
  //       Hello, {name}! Count:{itemCounter}
  //     </h1>
  //   );
  // };
  // 练习 props 展开/读取：先定义一个符合组件 props 形状的明细对象
  // {...obj} 展开时,obj 里不能出现组件 props 类型没有声明的字段,否则又会触发"白名单"报错
  const BasicColorComDetail = { color: "green", name: "BasicColorComDetail" };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    // 输入框的值在 title 里（受控组件），不是在事件 e 里
    console.log("提交的数据 title =", title);
    const resp = await fetch("/api/react-learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 传递的参数title, done
      body: JSON.stringify({ title, done: false }),
    });
    const j = await resp.json();
    console.log("接口返回：", j);
    // 本页采用「全量重拉」策略：add 后重新 GET 一次列表，保证与后端一致。
    // （另一种策略是「乐观更新」——本地先 setList 把新项插到前面，见 remove，少一次请求）
    setTitle("");
    setPage(1);
    setPageInput("1");
    getReactLearnList(1, pageSize);
  };
  const getReactLearnList = async (page: number, pageSize: number) => {
    // fetch 没有 query 选项，分页参数必须拼到 URL 上；sort=-id 让最新的排最前
    const resp = await fetch(
      `/api/react-learn?page=${page}&pageSize=${pageSize}&sort=-id`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const j = await resp.json();
    console.log("列表数据：", j);
    setList(j.data); // GET 返回的 data 是数组，直接替换列表
    setTotalPages(j.totalPages ?? 1); // 记录总页数，供分页控件使用
  };
  // 翻页：切换到第 p 页并重新拉取（直接把 p 传给 getReactLearnList，避免依赖 setPage 的异步更新）
  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    setPageInput(String(p));
    getReactLearnList(p, pageSize);
  };
  // 👉 手敲区 5(改):点"改"进入编辑态(把 id 和标题放进编辑态),不直接发请求
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };
  // 👉 手敲区 5(改):保存——PATCH 只传改后的 title,成功后退出编辑态并重拉
  const saveEdit = async (id: number) => {
    const title = setEditingText(editingText);
    // setXxx(newVal) 会把新值存进 state(确实存了),但它这个函数调用本身【返回 undefined】，接口参数editingText确实修改了，setEditingText返回得是undefined。永远别读 setter 的返回值
    console.log("保存的数据 title = undefined, 不是想象中的修改后的值", title);
    if (!editingText.trim()) return;
    await fetch(`/api/react-learn/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingText }),
    });
    setEditingId(null);
    getReactLearnList(page, pageSize);
  };
  const remove = async (id: number) => {
    await fetch(`/api/react-learn/${id}`, { method: "DELETE" });
    // 本地 setList(filter) 已经把那条从界面上拿掉了,UI 立刻更新,根本不需要再发一次 GET。这就是"乐观更新"——前端先自己改,不等后端回数据。反而是更推荐的删法(少一次请求)
    setList((prev) => prev.filter((t) => t.id !== id)); // 本地过滤掉
  };
  const SpeedMessage = ({ speed }: { speed: number }) => {
    const speedLimit = 80;
    const message =
      speed > speedLimit
        ? `超速 ${speed - speedLimit}km/h`
        : `正常${speedLimit}km/h, 当前速度${speed}km/h`;
    const bgColor = speed > speedLimit ? "bg-red-500" : "bg-green-500";
    const messageStyle: React.CSSProperties = {
      backgroundColor: bgColor,
      color: "#333",
      padding: "15px",
      margin: "10px 0",
      borderRadius: "8px",
      fontWeight: "bold",
      textAlign: "center",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    };
    return (
      <div style={messageStyle}>
        <p>你当前速度{speed}km/h</p>
        {message}
      </div>
    );
  };
  const ItemList = ({}) => {
    const listStyle: React.CSSProperties = {
      listStyle: "none",
      padding: 0,
    };
    return (
      <ul style={listStyle}>
        <Item description="123" done={true}></Item>
        <Item description="56" done={false}></Item>
      </ul>
    );
  };
  const Item = ({
    description,
    done,
  }: {
    description: string;
    done: boolean;
  }) => {
    return (
      <li>
        {description}---{done ? "已完成" : "未完成"}---
        {done && <span>已完成</span>}
      </li>
    );
  };
  const FileterdList = ({ done }: { done: boolean }) => {
    // done 是布尔，直接用 item.done === done 过滤（true→已完成，false→未完成）
    const filterList = list.filter((item) => item.done === done);
    return (
      <>
        <ul>
          {filterList.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
        {filterList.length === 0 && (
          <p className="text-gray-500">暂无过滤后的列表数据</p>
        )}
      </>
    );
  };
  const filteredList = list.filter((t) => {
    if (filter === "all") return true;
    if (filter === "done") return t.done === true;
    return t.done === false; // undone
  });

  // 练习 2：组件一挂载就拉一次全量列表（依赖空数组 = 只跑一次，≈ Vue 的 mounted）
  // 【概念·过期闭包 stale closure】
  // effect 的回调是个闭包，会"记住"它被创建那一刻的 page（首次渲染 page=1）。
  // 依赖数组 [] 表示只跑一次、永不重建，所以口袋里的 page 永远冻在 1。
  // 若这里写 getReactLearnList(page, pageSize) 并留空依赖，ESLint 会告警
  // "missing dependency: page"（怕你拿到过期值）。直接传字面量 1 既消除告警，
  // 又明确表达"挂载就拉第 1 页"的意图。同理 goPage 也直接传 p，不依赖异步的 setPage。
  useEffect(() => {
    getReactLearnList(1, pageSize); // 挂载只拉第 1 页（显式传 1，避免依赖闭包里的 page）
  }, []);
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">
        React 手敲练习 1 · 受控表单 + 提交接口
      </h1>
      <p className="text-sm text-gray-500">
        路由 <code>/react-learn</code> ｜ 目标：输入框受控 + 提交写库（POST
        /api/react-learn
      </p>

      {/* 👉 手敲区 3：表单 */}
      {/* <form onSubmit={add}>
            <input
              className="flex-1 rounded border px-2 py-1"
              placeholder="新待办标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
              新增
            </button>
          </form> */}
      <form onSubmit={add}>
        <input
          type="text"
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white">
          新增
        </button>
      </form>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as "all" | "done" | "undone")}
        className="rounded border px-2 py-1"
      >
        <option value="all">全部</option>
        <option value="done">已完成 (done:true)</option>
        <option value="undone">未完成 (done:false)</option>
      </select>

      {/* 👉 手敲区 4：列表渲染（key 必须用 t.id，不能用 index） */}
      {/* <ul className="space-y-2">
            {list.map((t) => (
              <li key={t.id} className="border-b py-1">#{t.id} {t.title}</li>
            ))}
          </ul> */}
      <ul className="space-y-2">
        {filteredList.map((item) => (
          <li key={item.id} className="flex items-center gap-2 border-b py-1">
            {editingId === item.id ? (
              // 编辑中：显示输入框 + 保存/取消
              <>
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <span onClick={() => saveEdit(item.id)}>保存</span>
                <span onClick={() => setEditingId(null)}>取消</span>
              </>
            ) : (
              // 普通态：显示标题 + 改
              <>
                <span>
                  #{item.id} {item.title}
                </span>
                <span>-----------</span>
                <span onClick={() => startEdit(item)}>修改</span>
              </>
            )}
            <span onClick={() => remove(item.id)}>删除</span>
          </li>
        ))}
      </ul>
      {/* 分页：输入页码跳转 + 上/下一页 */}
      <div className="flex items-center gap-2">
        <button
          className="rounded border px-2 py-1 disabled:opacity-40"
          onClick={() => goPage(page - 1)}
          disabled={page <= 1}
        >
          上一页
        </button>
        <span className="text-sm">
          第 {page} / {totalPages} 页
        </span>
        <button
          className="rounded border px-2 py-1 disabled:opacity-40"
          onClick={() => goPage(page + 1)}
          disabled={page >= totalPages}
        >
          下一页
        </button>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          className="w-16 rounded border px-2 py-1"
          placeholder="页码"
        />
        <button
          className="rounded bg-blue-600 px-3 py-1 text-white"
          onClick={() => {
            const p = Number(pageInput);
            if (p >= 1 && p <= totalPages) goPage(p);
          }}
        >
          跳转
        </button>
      </div>
      {/* 方式二：短路与 —— 满足才显示 */}
      {list.length === 0 && (
        <p className="text-gray-500">暂无数据，快去上面新增一条吧～</p>
      )}
      <div>过滤后的列表数据</div>
      <FileterdList done={true}></FileterdList>
      <BasicBlueCom></BasicBlueCom>
      <BasicColorfulCom></BasicColorfulCom>
      <BasicColorComProps name="BasicColorComProps"></BasicColorComProps>
      <BasicColorComProps
        color="yellow"
        name="BasicColorComProps"
      ></BasicColorComProps>
      <BasicColorComProps
        name={BasicColorComDetail.name}
        color={BasicColorComDetail.color}
      ></BasicColorComProps>
      <BasicColorComProps {...BasicColorComDetail} />
      <StaticCom name="StaticCom"></StaticCom>
      {/* 反面教材 演示"别在 render 改外部变量"*/}
      {/* <NoStaticCom name="NoStaticCom"></NoStaticCom> */}
      <div>
        <button onClick={() => setCount((count) => count + 1)}>{count}</button>
        {/* 危险：count 为 0 时页面会渲染出 "0" */}
        {count > 0 && <span className="badge">已点 {count} 次</span>}
        <img src="avatar.png" alt="avatar" width="64" />
      </div>
      {/* 条件渲染 */}
      <SpeedMessage speed={35}></SpeedMessage>
      <SpeedMessage speed={135}></SpeedMessage>
      <SpeedMessage speed={235}></SpeedMessage>
      <ItemList></ItemList>
    </main>
  );
}

/*
=== 接口契约（复用 social-start 自带 /api/todo，同源无需跨域）===
POST /api/todo
  body : { title: string, done?: boolean }
  resp : { code: 0, data: { id, title, done, createdAt, updatedAt }, msg: '新增成功' }

GET  /api/todo?page=1&pageSize=8&sort=-id
  resp : { code: 0, data: [...], total, totalPages, page, pageSize }
  （练习 2 会用到：useEffect 里 GET 拉列表 + 分页）
*/

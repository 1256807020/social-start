# Social Start

一个最小化的 **Next.js (App Router) + Tailwind CSS v4 + shadcn（base 风格）** 起步模板。

## 技术栈

- Next.js 16（Turbopack）
- React 19
- Tailwind CSS v4（`@tailwindcss/postcss`）
- shadcn — base-nova 风格（基于 `@base-ui/react`）
- 图标：`lucide-react`
- 包管理：pnpm

## 目录结构

```
app/
  globals.css           # Tailwind v4 + shadcn 主题变量
  layout.tsx            # 根布局
  page.tsx              # 首页（/）
  basic/page.tsx        # 演示页（/basic）
  todos/page.tsx        # 学习者背诵范本：服务端组件 SSR（/todos）+ todo-client.tsx 客户端子组件
  todo-client/page.tsx   # 学习者背诵范本：客户端组件全套 CRUD（/todo-client）
  api/                  # 全套 CRUD + 进阶接口（详见下方「目录结构（新增部分）」与「接口能力概览」）
  img/[name]/  file/[name]/   # 图片 / 通用文件静态访问
components/ui/button.tsx      # shadcn Button
lib/                    # 引擎与进阶模块（json-db/query/response/crud/route-utils/csv/captcha/aggregate/populate/media/file/auth）
```

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

构建与生产启动：

```bash
pnpm build
pnpm start
```

> ⚠️ 重启 / 重新构建前清场（避免旧进程占用端口、旧产物干扰）：先杀掉所有 node 进程
> （`powershell -NoProfile -Command "taskkill /F /IM node.exe"`），再删除旧构建 `rm -rf .next`，然后重新 `pnpm dev` / `pnpm build`。

## 添加 shadcn 组件

```bash
pnpm dlx shadcn@latest add button
```

> 注意：base 风格文档示例的图标库是 `@tabler/icons-react`，但本项目的标准图标库为 `lucide-react`
>（`components.json` 中 `iconLibrary: "lucide"`），复制示例时请对应替换图标导入。

## 环境变量

- `.env` — 本地开发（已纳入版本库，仅含非敏感的 `NEXT_PUBLIC_*` 占位）
- `.env.production` — 生产环境
- 真实密钥请放在 `.env.local`（已被 `.gitignore` 忽略，不会入库）

## 分支

- `main` — 主干，**保持不动，不与 `basic` 同步合并**。
- `basic` — 主力开发分支，所有开发在此进行。

---

# JSON CRUD 全栈基座（核心功能）

> 把原 **BasicApi（koa2）** 的「一个 JSON 文件 = 一套完整 CRUD 接口」核心思想，完整重写为 **Next.js App Router** 全栈版本，作为快速开发基座。

## 核心思想

**一个 JSON 文件 = 一张表 = 一套完整 CRUD 接口。** 无需数据库、无需写接口代码：

- 新建一个集合文件 `data/<resource>.json`（或直接 POST 即自动创建），就拥有了该资源的
  增删改查、分页、字段过滤、排序、关键字搜索、字段投影、树形、批量操作等能力。
- 统一响应：`{ code, data, msg, total?, page?, pageSize?, totalPages? }`，`code === 0` 表示成功。

## 工作原理

- **集合**：`data/<resource>.json`，内容必须是数组，每个元素是一条记录（建议含 `id`）。
- **存储引擎**（`lib/json-db.ts`）：读带 mtime 缓存；写采用「临时文件 + rename」原子替换，避免写一半损坏；
  per-集合写队列保证同一集合的 读-改-写 串行执行，天然避免并发覆盖。
- **id**：请求体不传 `id` 时自动生成递增数字 id（带时间戳）；传了且已存在则报错。
- **时间戳**：默认自动维护 `createdAt` / `updatedAt`（可用 `AUTO_TIMESTAMP=0` 关闭）。

## 目录结构（新增部分）

```
lib/json-db.ts          存储引擎（读/写/事务/集合管理/原子写）
lib/query.ts            查询语法（分页/排序/过滤/关键字/字段操作符/树形）
lib/response.ts         统一响应与错误码
lib/crud.ts             通用 CRUD 处理函数（纯逻辑，与框架解耦）
lib/route-utils.ts      路由层工具（提取 query / 解析 body / 包装响应）
app/api/[resource]/route.ts            列表 / 新增 / 清空
app/api/[resource]/[id]/route.ts       详情 / 全量替换(PUT) / 增量修改(PATCH) / 删除
app/api/[resource]/count/route.ts       数量统计（支持过滤）
app/api/[resource]/batch-create/        批量新增（body 为数组）
app/api/[resource]/batch-update/        批量修改（body 为 [{ id, ... }]）
app/api/[resource]/batch-delete/        批量删除（{ ids:[...] } 或 [..] 或 ids=1,2）
app/api/health/route.ts                 健康检查
app/api/collections/route.ts            集合列表（记录数 / 体积 / 更新时间）
app/api/collections/[name]/route.ts     集合详情（字段结构自动推断 + 前 5 条预览）/ 删除
```

## API 速查

> 下方为核心 CRUD 速查；**完整接口（含图片 / 文件 / 验证码 / 聚合 / 关联 / 导入导出等进阶模块）见文末「接口能力概览」**。

### 业务接口（`resource` = 集合名，不含 `.json`）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/{resource}` | 列表（分页 / 过滤 / 排序 / 关键字 / 树形 / 投影） |
| POST | `/api/{resource}` | 新增单条（body 为对象）或批量（body 为数组） |
| DELETE | `/api/{resource}?confirm=1` | 清空集合（需 `confirm=1` 防误删） |
| GET | `/api/{resource}/{id}` | 详情 |
| PUT | `/api/{resource}/{id}` | 全量替换 |
| PATCH | `/api/{resource}/{id}` | 增量修改 |
| DELETE | `/api/{resource}/{id}` | 删除单条 |
| GET | `/api/{resource}/count` | 数量统计（支持过滤条件） |
| POST | `/api/{resource}/batch-create` | 批量新增（数组） |
| POST | `/api/{resource}/batch-update` | 批量修改（`[{ id, ... }]`） |
| POST | `/api/{resource}/batch-delete` | 批量删除（`{ ids:[...] }` 或 `[..]` 或 `ids=1,2`） |

### 管理接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查（环境 / 运行时长 / 集合数 / 数据目录） |
| GET | `/api/collections` | 集合列表 |
| GET | `/api/collections/{name}` | 集合详情：字段结构自动推断 + 前 5 条预览 |
| DELETE | `/api/collections/{name}` | 删除集合文件 |

### 查询语法（GET 列表的 query 参数）

- **分页**：`page`、`pageSize`（默认 10，上限 500）、`currentPage`
- **排序**：`sort=field1,-field2`（`-` 降序、`+` 升序）、`order=asc|desc`
- **关键字**：`keyword=文本`、`keywordFields=f1,f2`（限定搜索字段）
- **投影**：`fields=f1,f2`（只返回指定字段）
- **字段过滤操作符**（加在字段名后缀）：`_like` `_in` `_nin` `_ne` `_gte` `_lte` `_gt` `_lt`
  例如：`status=1`、`age_gte=18`、`name_like=张`
- **树形**：`tree=1`、`parentKey=parentId`、`childrenKey=children`

## 配置（环境变量）

| 变量 | 默认 | 说明 |
|---|---|---|
| `DATA_DIR` | `data` | 数据目录 |
| `PAGE_SIZE` | `10` | 默认每页条数 |
| `MAX_PAGE_SIZE` | `500` | 每页上限 |
| `AUTO_TIMESTAMP` | `1` | 是否自动维护 `createdAt`/`updatedAt`（设 `0` 关闭） |

## 示例

```bash
# 启动
pnpm dev   # http://localhost:3000

# 新增一条
curl -X POST http://localhost:3000/api/post -H 'Content-Type: application/json' \
  -d '{"title":"Hello","status":1}'

# 列表：第 1 页、每页 10、按 id 降序、状态=1
curl "http://localhost:3000/api/post?page=1&pageSize=10&sort=-id&status=1"

# 批量新增
curl -X POST http://localhost:3000/api/post -H 'Content-Type: application/json' \
  -d '[{"title":"A","status":1},{"title":"B","status":0}]'

# 树形菜单
curl -X POST http://localhost:3000/api/menu -H 'Content-Type: application/json' \
  -d '[{"id":1,"name":"系统","parentId":0},{"id":2,"name":"用户","parentId":1}]'
curl "http://localhost:3000/api/menu?tree=1"
```

## 与 BasicApi（koa2）的对应关系与迁移说明

- 核心引擎（存储 / 查询 / CRUD / 统一响应）**逻辑等价移植**，业务接口契约一致。
- 系统/元数据接口遵循 **Next.js 标准路由约定**（不以 `_` 下划线前缀隐藏路由）：
  `/api/health`、`/api/collections`、`/api/:resource/count`。
  相对原 BasicApi 的 `/api/_health`、`/api/_collections`、`/api/:resource/_count` 写法，
  本基座去掉了下划线私有文件夹前缀，让这些端点作为常规路由直接可访问。
- 鉴权（`ADMIN_TOKEN`）**已内置为可选能力**：由 `proxy.ts`（Next.js 16 Proxy 文件约定，仅匹配 `/api/*`）+ `lib/auth.ts` 实现，默认关闭（不设置则透明放行），启用后只校验写操作、读操作开放；**核心 `lib/crud.ts` / `lib/json-db.ts` 零改动**（详见下方「生产鉴权」）。
- 图片服务、通用文件（附件）、集合数据批量导入 / 导出（JSON/CSV）、图形验证码、聚合（`aggregate`）、关联（`populate`）**均已作为独立进阶模块接入**，零改核心。
  仅 **RBAC 完整权限体系**、**微信 / 社区 / 积分等业务模块** 按需求**暂不做**（已在「能力清单」标为待办）；本基座已预留 `app/api/` 与 `app/<page>/page.tsx` 扩展点。

## 生产鉴权（进阶 / 可选，不干扰核心）

- 核心 CRUD 默认**完全开放**（本地开发友好），不绑定任何鉴权。
- 启用方式：部署时设置环境变量 `ADMIN_TOKEN=<你的密钥>`。
- 行为：启用后，**写操作**（POST / PUT / PATCH / DELETE）必须携带正确 token；
  **读操作**（GET / HEAD / OPTIONS，含列表、详情、统计）始终开放——兼顾 SEO 爬虫公开抓取与管理写保护。
- 携带方式三选一：`Authorization: Bearer <token>`、`x-admin-token: <token>`、查询参数 `?adminToken=<token>`。
- 实现位置：`proxy.ts`（Next.js 16 Proxy 文件约定，仅匹配 `/api/*`）+ `lib/auth.ts`（校验逻辑）。
  **核心 `lib/crud.ts` / `lib/json-db.ts` 零改动**，鉴权是独立的请求拦截层能力（Next.js 16 Proxy）。
- 鉴权失败返回统一信封 `{ code: 40001, data: null, msg: '未授权...' }`（HTTP 401）。

## 部署注意

- 本基座基于本地文件系统存储（`data/*.json`），适合本地开发与自托管 Node 服务。
- Serverless（如 Vercel）文件系统只读，需挂载持久卷或**替换 `lib/json-db.ts` 的存储实现**
  （如改用数据库）。上层 API 与查询语法不变，只需替换存储后端即可平滑迁移。

## 接口能力概览

> 统一响应信封：`{ code, data, msg, total?, page?, pageSize?, totalPages? }`（`code=0` 成功）。
> 设 `ADMIN_TOKEN` 后，所有**写操作**需携带 token（见「生产鉴权」）；**读操作**始终开放。

### 能力清单（待办 / 已办）

| 状态 | 能力 | 说明 |
|---|---|---|
| ✅ 已办 | 通用 CRUD 引擎 | 一个集合 = 一套完整接口（增删改查 / 分页 / 过滤 / 排序 / 树形 / 批量） |
| ✅ 已办 | 系统 / 元数据接口 | health / collections / 集合详情与删除 |
| ✅ 已办 | 媒体 / 图片模块 | 上传 / 列表 / 信息 / 删除 / 占位图 / 静态访问 |
| ✅ 已办 | 生产鉴权（可选） | `ADMIN_TOKEN` 保护写操作，独立 Proxy 拦截层，零改核心 |
| ✅ 已办 | 图形验证码 | `/api/captcha` 生成 + 校验（SVG，一次性） |
| ✅ 已办 | 聚合统计 | `/api/:resource/aggregate`（`groupBy` / `sum` / `avg` / `min` / `max`） |
| ✅ 已办 | 关联 `populate` | `?populate=author` 外键值替换为整条记录 |
| ✅ 已办 | 通用文件（附件） | `/api/file/upload`，存 `public/uploads`，`/uploads/:name` 访问 |
| ✅ 已办 | 集合数据批量导入 / 导出 | `/api/:resource/export`（json/csv）、`/api/:resource/import` |
| 📋 待办 | RBAC 完整权限体系 | 用户 / 角色 / 权限 / 部门（`work/router/rbac/`，较重）—— 按需，暂不做 |
| 📋 待办 | 微信 / 社区 / 积分等业务模块 | `work/other/` 设计文档 —— 按需，暂不做 |

### 一、通用 CRUD（一个集合 = 一套完整接口）
把 URL 里的 `:resource` 换成任意集合名（如 `menu`、`article`、`todo`）即可，无需写代码：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/:resource` | 列表：分页 / 过滤 / 排序 / 关键字 / 字段投影 / 树形 |
| POST | `/api/:resource` | 新增：对象=单条，数组=批量 |
| GET | `/api/:resource/count` | 数量统计（支持过滤条件） |
| GET | `/api/:resource/:id` | 详情 |
| PUT | `/api/:resource/:id` | 修改：默认增量合并；`?replace=1` 全量替换 |
| DELETE | `/api/:resource/:id` | 删除单条 |
| POST | `/api/:resource/batch-create` | 批量新增（数组） |
| POST | `/api/:resource/batch-update` | 批量修改（`[{id,...}]`） |
| DELETE | `/api/:resource/batch-delete` | 批量删除（`{ ids:[1,2] }` 或 `ids=1,2`） |
| DELETE | `/api/:resource?confirm=1` | 清空集合 |

### 二、系统 / 元数据
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api` | API 索引 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/collections` | 集合列表（含记录数 / 体积） |
| DELETE | `/api/collections/:name` | 删除集合 |

### 三、媒体 / 图片（进阶，独立模块）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/image/upload` | 上传（单/多文件，字段名 `file`，存 `data/uploads`） |
| GET | `/api/image/list` | 图片列表（分页） |
| GET | `/api/image/info/:name` | 图片信息 |
| DELETE | `/api/image/:name` | 删除图片 |
| GET | `/api/image/placeholder/:size` | 占位图 SVG（`/api/image/placeholder/300x200?text=hi`） |
| GET | `/img/:name` | 静态访问（公开，带缓存） |
### 四、通用文件（附件，进阶，独立模块）
> 存储落点：`public/uploads/`（Next.js 公开目录），文件直接以 `/uploads/<name>` 访问，无需自建静态路由。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/file/upload` | 上传通用文件（字段 `file`，任意格式，存 `public/uploads`） |
| GET | `/api/file/list` | 文件列表（分页） |
| GET | `/api/file/info/:name` | 文件信息 |
| DELETE | `/api/file/:name` | 删除文件 |
| GET | `/uploads/:name` | 静态访问（由 Next 公开目录直接托管） |
| GET | `/file/:name` | 静态访问（兼容别名，同上文件） |

### 五、集合数据批量导入 / 导出（文件批处理，进阶，独立模块）
> 对任意集合做 JSON / CSV 的批量导入导出，不依赖 `work/file/` 的文件系统引擎，直接走核心 CRUD。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/:resource/export?format=json\|csv` | 导出集合为下载文件（默认 json） |
| POST | `/api/:resource/import` | 导入集合：JSON 数组 body，或上传 `.json`/`.csv` 文件（字段 `file`），批量写入 |

### 六、验证码 / 聚合 / 关联（进阶，独立模块，零改核心）
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/captcha` | 生成图形验证码（SVG），返回 `{ captchaId, image }` |
| POST | `/api/captcha/verify` | 校验验证码（`{ captchaId, code }` → `{ success }`，一次性） |
| GET | `/api/:resource/aggregate` | 聚合：`?groupBy=status&sum=amount&avg=score&min=age&max=age` |
| GET | `/api/:resource?populate=author` | 关联：`item.author` 存的外键值替换为 `authors` 集合整条记录（可 `author:users:uid`） |

### 七、查询参数（GET 列表 / 计数通用）
- 分页：`page`、`pageSize`（上限 500）、`currentPage`
- 排序：`sort=字段`（前缀 `-` 降序）、`order=asc|desc`
- 过滤：任意字段；操作符后缀 `_like` `_in` `_nin` `_ne` `_gte` `_lte` `_gt` `_lt`
- 关键字：`keyword`、`keywordFields=字段1,字段2`
- 投影：`fields=字段1,字段2`
- 树形：`tree=1`、`parentKey`（默认 `parentId`）、`childrenKey`（默认 `children`）

### 八、可返回的响应数据类型
单对象（详情） / 数组（裸 `data`） / 数组带分页（`{items,total,page,...}`） /
树状嵌套（`children`） / 统计（`{total}`） / 操作结果（如 `{deleted:3}`） /
统一错误信封（`{code,msg}`） / 二进制流（图片、`image/svg+xml` 占位图）。

> 演示页：`app/basic/page.tsx`（路由 `/basic`）已内置 Todo 分页/树形、图片上传、图形验证码三块联动示例。

---

## 系统综合分析评价（架构师视角）

### 一、总体定位与成熟度
- Social Start 已从一个「Next.js 起步模板」演进为**生产可用的全栈 CRUD 基座**：零数据库、零接口代码即可获得企业级数据接口，并补齐了图片 / 文件 / 验证码 / 聚合 / 关联 / 导入导出等进阶能力。
- 成熟度：核心引擎稳定（原子写 + per-集合写队列），进阶模块均为「零改核心」的插拔式，能力清单 9/11 已办。

### 二、架构亮点
- **关注点解耦**：`lib/json-db`（存储）/ `lib/query`（查询）/ `lib/response`（信封）/ `lib/crud`（纯逻辑）/ `lib/route-utils`（框架适配）分层清晰，核心不依赖 Next 运行时，未来换存储 / 换框架成本低。
- **统一信封 + 错误码**：前后端契约稳定，`{ code, data, msg }` 一套到底，前端可无脑 `if (code === 0)`。
- **扩展不侵入核心**：所有进阶能力走 `proxy.ts` 拦截层或路由层后处理，绝不回头改 `crud.ts`，符合开闭原则。
- **文件系统原子写 + 串行写队列**：避免并发覆盖与半截文件，是「无数据库也安全」的关键。

### 三、能力覆盖度（企业级评估）
- 返回形态覆盖 ~90%+：对象 / 裸数组 / 分页数组 / 树 / 字典统计 / 操作结果 / 错误信封 / 二进制流（图片、SVG）。
- 已具备（除 RBAC 外）绝大多数后台能力：可选鉴权、验证码、聚合、关联、批量、导入导出、静态托管。
- 缺口（已标待办）：完整 RBAC、多租户、业务域（微信 / 社区 / 积分）。非技术阻塞，均为「加模块」而非「改核心」。

### 四、与 AI 浪潮的契合度（AI 潮流视角）
- **AI 生成 CRUD**：本基座「一个 JSON = 一套接口」正是 LLM 最擅长生成的产物——让 AI 写 `data/<resource>.json` + 前端 `app/<resource>/page.tsx`，即可秒出一套增删改查应用，契合 "vibe coding / 自然语言建应用" 趋势。
- **低代码 / Agentic 开发**：动态集合 + 通用查询语法，天然适合做 Agent 的工具层（Agent 调 `/api/:resource` 读写数据），无需预定义 schema。
- **Serverless + AI SDK**：`lib/json-db` 可无缝替换为 Postgres / D1 / Blobs（上层零改），随时接 Vercel AI SDK / 流式 RSC，向 AI 原生应用演进。
- 一句话定位：**它是「AI 帮你写业务」的最佳底座之一**——把重复的后端样板从 AI 的上下文里彻底拿掉。

### 五、已知约束与演进路线
- Serverless 文件系统只读：上线需替换 `lib/json-db` 存储后端（已解耦，成本低）。
- 校验：目前靠路由层手动处理，建议补全局请求校验中间件。
- 分页上限 500：大数据量档需把查询下沉到存储（SQL WHERE）。
- 测试：核心引擎建议补 Vitest 单测（原子写 / 查询语法）作为下一步。

### 六、给 React 学习者：如何加一个新页面 / 接口
- **页面（重点）**：在 `app/` 下建 `app/<名>/page.tsx`，导出默认 React 组件，路由 `/<名>` 自动生效——
  **注意是 `page.tsx`（放在文件夹里），不是平铺的 `app/<名>.tsx`**（后者不会注册路由；本站演示页最初写成 `app/basic.tsx` 实测返回 404，已修正为 `app/basic/page.tsx`）。
  ```tsx
  // app/hello/page.tsx
  export default function Hello() {
    return <h1 className="p-8 text-2xl font-bold">Hello Social Start</h1>
  }
  // 访问 http://localhost:3000/hello 即可，无需任何路由配置
  ```
- **接口**：写 `app/api/<名>/route.ts` 并 `export async function GET/POST(...)`；或直接复用通用 CRUD——只要 `data/<resource>.json` 存在（或首次 POST 自动建），`/api/<resource>` 全套接口即刻可用，不用写任何代码。
- 学习建议顺序：① 跑通 `/basic` 演示页看三块联动 → ② 仿写 `app/hello/page.tsx` 改文案 / 样式 → ③ `curl` 调 `/api/todo` 体会 CRUD → ④ 读 `lib/crud.ts` 理解纯逻辑如何与框架解耦。

---

## 七、学习者：三种正规数据请求写法（A / B / C）

> 路线铁律：**页面 = `app/<段>/page.tsx`；接口 = `app/api/<段>/route.ts`；平铺的 `.tsx` 都不是路由。**
> 三种写法**都能做标准 Todo 增删改查**，只是分工不同：
> - **C（接口底座）**：后端 `route.ts`，提供增删改查能力，被 A / B 调用——它本身不直接渲染页面。
> - **A（客户端组件）**：一个 `.tsx` 内用 `useEffect + fetch` 把查/增/删/改全包了，最直观，最适合初学 CRUD。
> - **B（服务端组件 SSR）**：列表在服务端 `await fetch` 渲染（首屏最快、SEO 好）；增删改交给客户端子组件，改完 `router.refresh()` 重新拉——更"Next.js 地道"。
> 仓库里已备好实体范本，可直接 `pnpm dev` 后访问对照背诵：
> - **A 版**：`app/todo-client/page.tsx`（路由 `/todo-client`，客户端组件一套 CRUD 全包）
> - **B 版**：`app/todos/page.tsx` + `app/todos/todo-client.tsx`（路由 `/todos`，SSR 列表 + 客户端子组件写）
> - **C 版**：通用 CRUD 已内置（`/api/todo` 开箱即用）；自定义接口示例见下方 C 段 `app/api/hello/route.ts`。

### A · 客户端组件（一套 CRUD 全在一个文件，最易上手）
```tsx
// app/hello/page.tsx
'use client'
import { useEffect, useState } from 'react'
export default function Hello() {
  const [list, setList] = useState<any[]>([])
  const load = () => fetch('/api/todo?pageSize=20&sort=-id').then(r => r.json()).then(j => setList(j.data || []))
  useEffect(() => { load() }, [])
  const add = async (e: any) => {
    e.preventDefault(); await fetch('/api/todo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: e.target.title.value, done:false }) }); load()
  }
  const del = async (id:number) => { await fetch(`/api/todo/${id}`, { method:'DELETE' }); load() }
  return (<main className="p-6">
    <form onSubmit={add}><input name="title" className="border rounded px-2 py-1" placeholder="标题"/><button type="submit">新增</button></form>
    <ul>{list.map((t:any) => <li key={t.id}>{t.title} <button onClick={()=>del(t.id)}>删</button></li>)}</ul>
  </main>)
}
```

### B · 服务端组件 SSR（仓库范本 `app/todos`，列表服务端渲染 + 服务端分页 + 客户端子组件写）
> 分页由 URL `?page=` 驱动（`searchParams`）：点链接 → 服务端重新按页取数，无需客户端 `fetch`。已含「新增 / 刷新」按钮（刷新 = `router.refresh()` 重新执行服务端组件）。
```tsx
// app/todos/page.tsx  （Server Component：可 async/await，无需 'use client'）
import { TodoClient, type Todo } from './todo-client'
async function getTodos(): Promise<Todo[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/todo?pageSize=20&sort=-id`, { cache: 'no-store' })
  return (await res.json()).data || []
}
export default async function TodosPage() {
  const todos = await getTodos()
  return <main className="mx-auto max-w-3xl p-6"><h1 className="text-2xl font-bold">Todo SSR 范本</h1><TodoClient initial={todos} /></main>
}
```
```tsx
// app/todos/todo-client.tsx  （'use client'：负责增/改/删，改完 router.refresh()）
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
export function TodoClient({ initial }: { initial: any[] }) {
  const router = useRouter(); const refresh = () => router.refresh()
  const add = async (e: any) => { e.preventDefault(); await fetch('/api/todo', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: e.target.title.value, done:false }) }); refresh() }
  const del = async (id:number) => { await fetch(`/api/todo/${id}`, { method:'DELETE' }); refresh() }
  return (<><form onSubmit={add}><input name="title"/><button>新增</button></form>
    <ul>{initial.map((t:any) => <li key={t.id}>{t.title} <button onClick={()=>del(t.id)}>删</button></li>)}</ul></>)
}
```

### C · 接口（Route Handler，后端 `route.ts`，A/B 都来调它）
```ts
// app/api/hello/route.ts  自定义接口示例（通用 CRUD 不用写，POST 即自动建集合）
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ code: 0, data: { hi: 'from api' }, msg: 'success' })
}
// 本项目通用 CRUD 已内置：任意集合（如 todo）直接拥有 /api/todo 全套增删改查，无需写代码。
```

### 记忆口诀
- **查得最快用 B（SSR）；交互最简单用 A（客户端）；数据从哪来都走 C（接口）**。
- 绝不直接 `import` / `fs.readFile` 读 `data/*.json`——绕过 CRUD 逻辑、Serverless 也读不到，不是正规架构。
- 若生产设了 `ADMIN_TOKEN`，A / B 的**写请求**要带 `Authorization: Bearer <token>`（读请求始终开放）。

---

## 八、基于本基座能做什么站点（含 SEO 能力）

> 结论：本基座已能完整做出 **博客 / 新闻 / 文档 / 软件站 / 导航站**，SEO 用 Next.js 原生能力补齐即可；上线前把 JSON 存储换成 DB、补全文搜索与（可选）后台鉴权，即达生产级。

### 8.1 内容站建模（直接复用 CRUD 引擎，无需写后端）

| 站点 | 集合设计 | 要点 |
|---|---|---|
| 博客 Blog | `posts`（`title/body/categoryId/tags/publishedAt`） | 分类用 `categoryId` 关联；标签走 `_in` 数组查询；`body` 存 Markdown |
| 新闻 News | 同 Blog，时间序为主 | `sort=-publishedAt`；频道 = `categoryId` |
| 文档 Docs | `docs`（`parentId` 章节树） | 天然适配 `?tree=1` 树形；左侧目录直接复用 `/basic` 的 `TreeNode` 思路 |
| 软件站 | `software` + `category` 树 | 分类导航 + 详情页 + 下载链接 / 评分字段 |
| 导航站 | `links` + `category` 树 | 最轻量，几乎零业务逻辑 |

### 8.2 SEO 能力（Next.js 全部开箱，无需造轮子）

- **静态化 / SSR**：`generateStaticParams` +（默认 SSR 或 `output: 'export'`）把文章 / 详情页预渲染成静态 HTML，爬虫友好。
- **动态元信息**：`generateMetadata` 每篇文章生成 `title` / `description` / Open Graph 标签。
- **站点地图 / 爬虫协议**：`app/sitemap.ts`、`app/robots.ts` 直接产出。
- **结构化数据 JSON-LD**：博客 `Article`、软件站 `SoftwareApplication`、导航站 `ItemList`，塞进页面拿富媒体搜索结果。
- **RSS**：写个 route handler 输出 XML（思路同 `/export`）。

### 8.3 上线前的真实约束与升级路径

1. **存储是 JSON 文件**：读多写少（内容站正是此负载）完全够；高并发 / 大流量 / 评论 / 多作者时需换 DB。好消息是 `lib/crud.ts` 与存储无关——把 `lib/json-db.ts` 换成 Prisma/Postgres，路由层一行不动（同款解耦思路已在 BasicNest 验证）。
2. **无全文搜索**：`query.ts` 仅有 `contains` 关键字匹配，非 FTS。文档站搜索建议接 **Pagefind**（构建期静态索引，零后端，与 SSG 绝配）或 FlexSearch。
3. **无后台鉴权**：当前系统无 auth，纯展示站不用管；要「可发布后台」需补登录（可选 `ADMIN_TOKEN` 仅保护写操作）。
4. **Markdown/MDX**：正文存 MD 字符串，渲染层接 `@next/mdx` 或 `react-markdown` 即可。

---

## 九、Nuxt4 对等能力与 Vue3 学习路线

> 结论：**Nuxt4 能搭出完全一样的系统**，技术层级对等；且可作为你学习 **Vue3** 的基座（先在本项目学 React/Next，再去 Nuxt，遵循同一套「初级 → 中级 → 高级」进阶路线）。

### 9.1 Nuxt4 能否做一样的（能力映射）

| 能力 | 本基座（Next.js / React） | Nuxt4（Vue3）对等物 |
|---|---|---|
| 路由 | App Router 文件路由 | Nuxt 文件路由（更约定式） |
| SSR/SSG/SEO | `generateMetadata` / `generateStaticParams` | `useSeoMeta` / `useHead` + `nuxt.config` prerender |
| 站点地图 | `app/sitemap.ts` | `@nuxtjs/sitemap` |
| API | `app/api` route handlers | Nitro `server/api`、`server/routes`（同款文件路由） |
| 组件库 | shadcn（React） | `shadcn-vue` / **Nuxt UI** / Reka UI |
| 内容站 | 自写 JSON CRUD / MDX | **`@nuxt/content`**（专为 MD/MDX/YAML/CSV 设计，比自造 CRUD 更省力） |

- **差异点（非能力差距，是生态取向）**：内容站 Nuxt 用 `@nuxt/content` 读 `content/` 目录 markdown，自带导航 / 搜索 / 高亮，几乎零后端；Next 这边要自接 MDX + 引擎。
- **可复用部分**：本基座 `lib/crud.ts` 是**纯 TS、与框架无关**，原样搬到 Nuxt 的 Nitro server route 即可跑（Node 运行时通用）——「一个 JSON = 一套 CRUD」核心不绑定 React。
- **组件层换皮**：shadcn 的 React 组件不能直接用，改用 shadcn-vue / Nuxt UI，但交互模式一致。
- **部署**：Nitro 部署目标更广（Node / Serverless / Edge / Cloudflare Pages 一键），与 Next 旗鼓相当。

### 9.2 Nuxt4 作为 Vue3 学习基座（初级 → 中级 → 高级）

- **定位**：本项目（social-start，Next/React）是你的 **React 学习基座**；**Nuxt4 是你的 Vue3 学习基座**，二者路线对称。
- **学习顺序**：先在本项目吃透 React/Next（服务端组件 SSR、客户端组件 CRUD、通用 CRUD 引擎），再转 Nuxt4 学 Vue3（组合式 API、`<script setup>`、Nitro server route），复用同一套「一个集合 = 一套接口」思维。
- **进阶路线（初级 → 中级 → 高级）**：与仓库根 `初级中级高级进阶.md` 的 React 路线对应，Vue3 路线同样分三级：
  - **初级**：跑通 Nuxt 起步页 + 调通用 CRUD（理解「页面 = `pages/<名>.vue`，接口 = `server/api/<名>.ts`」）。
  - **中级**：SSR 列表 + 客户端子组件写（Nuxt 的 `useFetch` / `useAsyncData` 对应 React 的 `useEffect` / 服务端 `await fetch`）。
  - **高级**：内容站（接 `@nuxt/content`）+ SEO（`useSeoMeta` / `sitemap`）+ 把本基座 `lib/crud.ts` 纯逻辑移植到 Nitro，做出与本项目对等的 Nuxt 版快速开发平台。

---

## 十、分支状态（2026-09-27 起）

- `main` — **已正式锁定（frozen）**，作为稳定基线，最终经 FF 合并追平到 `9d0b7ae`；后续只允 `git merge --ff-only basic`，不 rebase/reset。
- `basic` — **活跃分支**，所有开发 / 学习在此进行（提交只落 basic）。
- 学习新概念（Zustand / Zod / Vue3 等）：从 `basic` 拉 `learn/<topic>` 分支，互不干扰、可丢弃。

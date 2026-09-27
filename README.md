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
  globals.css      # Tailwind v4 + shadcn 主题变量（标准模板）
  layout.tsx       # 根布局
  page.tsx         # 首页（水平垂直居中的带图标按钮示例）
components/
  ui/button.tsx    # shadcn Button
lib/
  utils.ts         # cn() 工具（clsx + tailwind-merge）
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

- `main` — 主干
- `basic` — 开发分支

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
- 鉴权（`adminToken`）未内置：原 BasicApi 的清空/删除集合接口默认开放（本地开发友好）。
  生产环境可在 `lib/crud.ts` 或路由层接入 Next 中间件做鉴权。
- 图片服务、文件批处理、RBAC、微信等扩展模块**未纳入基座核心**（与 Next 部署模型 / Serverless
  文件系统约束不符），可作为后续按需扩展；本基座已预留 `app/api/` 路由扩展点。

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

### 四、查询参数（GET 列表 / 计数通用）
- 分页：`page`、`pageSize`（上限 500）、`currentPage`
- 排序：`sort=字段`（前缀 `-` 降序）、`order=asc|desc`
- 过滤：任意字段；操作符后缀 `_like` `_in` `_nin` `_ne` `_gte` `_lte` `_gt` `_lt`
- 关键字：`keyword`、`keywordFields=字段1,字段2`
- 投影：`fields=字段1,字段2`
- 树形：`tree=1`、`parentKey`（默认 `parentId`）、`childrenKey`（默认 `children`）

### 五、可返回的响应数据类型
单对象（详情） / 数组（裸 `data`） / 数组带分页（`{items,total,page,...}`） /
树状嵌套（`children`） / 统计（`{total}`） / 操作结果（如 `{deleted:3}`） /
统一错误信封（`{code,msg}`） / 二进制流（图片、`image/svg+xml` 占位图）。

### 六、BasicApi 仍可按需迁入的进阶能力（均不干扰核心）
- **文件批处理**：批量导入 / 导出 JSON、CSV（`work/file/`）——进阶工具。
- **RBAC 完整权限体系**：用户 / 角色 / 权限 / 部门（`work/router/rbac/`）——较重，建议分阶接入。
- **通用非图片附件上传**：当前媒体模块限定图片格式，可放宽支持任意文件。
- **微信 / 社区互动 / 积分**等业务特定模块（`work/other/` 设计文档）——按需。

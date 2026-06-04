# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bio Spring 业务前台（app.bio-spring.top）— Next.js 14 多模块业务应用，消费 FastAPI 后端（`api.bio-spring.top`）。包含 LLM 用量分析、数字土壤 IoT 监控、考勤管理等业务模块。

## Commands

```bash
npm run dev        # 开发服务器（端口 3001）
npm run build      # 生产构建
npm run start      # 启动生产服务器
npm run lint       # ESLint
```

No test framework is configured.

## Architecture Principles

构建 Next.js（App Router）+ FastAPI 应用时，坚持 **"less is more"**：

- 前端专注 UI 与交互，后端专注数据与业务逻辑
- Next.js 优先使用 Server Components 渲染页面，仅在必要时使用 `"use client"`
- 所有数据通过统一 API（FastAPI）获取，避免前端直连数据库
- 使用 fetch + 基础缓存策略（如 revalidate）即可，不做过度优化
- 目录结构保持扁平清晰，避免过度抽象
- 状态管理优先局部 state，避免引入复杂全局状态库
- FastAPI 提供简洁 REST 接口，使用 Pydantic 定义数据结构，保证类型一致
- 整体架构以 **"能跑、清晰、易维护"** 为核心，避免引入不必要的中间层、框架和复杂设计

## Architecture

### Routing & Layout

- **App Router** (`src/app/`) with route groups：
  - `(authenticated)/` — 受保护页面，含 sidebar + header 布局；未认证重定向 `/login`
  - `/login` — 公开登录页
  - `/` — 根页面显示模块选择卡片
- 使用模块注册系统（`src/lib/moduleRegistry.ts`）动态生成 Header 和 Sidebar 导航

### Module System

应用按模块组织，每个模块是独立的业务单元。模块定义在 `src/lib/moduleRegistry.ts`：

```typescript
interface ModuleDefinition {
  id: string           // 如 'llm-usage', 'digital-soil'
  label: string
  icon: string         // Material Symbols 图标名
  defaultRoute: string // 模块入口路由
  navItems: NavItem[]  // 子导航
}
```

当前模块：

| Module | Route | Description |
|--------|-------|-------------|
| `llm-usage` | `/llm-usage/*` | API Key 管理、Token 用量统计与图表、明细查询 |
| `digital-soil` | `/digital-soil/*` | IoT 传感器监控、OHLC 图表、数据查询 |
| `attendance` | `/attendance/*` | 考勤管理（占位，尚未实现） |
| `biogas-literature` | `/biogas-literature/*` | 还田科普：文献上传、文献管理、LLM 解读、文献问答（需 biogas-literature 模块权限） |

权限过滤：`admin` 角色看到所有模块；普通用户只看到 `user.modules` 数组中的模块。

### Auth Flow

- JWT token 存储在 `localStorage`（`llm_usage_token`, `llm_usage_token_expires`）
- `AuthProvider`（React Context）包裹整个应用（root layout）
- `useAuth()` hook 提供 `{ isLoggedIn, user, login, logout, loading }`
- API 拦截器自动附加 token，401 时清除 token 并重定向 `/login`

### API Layer (`src/lib/api.ts`)

- Axios 实例，baseURL 由 `NEXT_PUBLIC_API_BASE_URL` 控制（默认 `http://localhost:8000`）
- 所有响应包裹在 `ApiResponse<T>` 信封中：`{ code, message, data, meta? }`
- `code === 0` 表示成功，其他值拦截器抛异常
- 错误处理解析 FastAPI 的 `detail` 字段
- 按领域组织 API 函数：Auth、LLM Keys、LLM Usage、Digital Soil、Biogas Literature

### Key Patterns

- **数据获取**：`useApi<T>(fetcher, deps)` hook（`src/hooks/useApi.ts`）— 返回 `{ data, loading, error, refetch }`；复杂页面使用 `useCallback` + `useEffect` + local state 模式
- **UI 组件**：自定义组件库 `src/components/ui/`（Button、Card、Table、Modal、Input、Select、Badge、ConfirmDialog、LoadingSpinner、Pagination）
- **图表**：ECharts 通过 `echarts-for-react` 封装，图表组件在 `src/components/charts/`
- **TypeScript 类型**：所有 API 类型集中在 `src/lib/types.ts`
- **路径别名**：`@/*` 映射到 `./src/*`
- **时间处理**：`src/lib/time.ts` 提供 `parseTimestamp`、`formatDateTime`、`formatDate`；土壤数据涉及 UTC → 北京时间转换（+8h）

### Environment Variables

- `.env` — 开发环境 API 地址 + 测试账号
- `.env.production` — 生产 API 地址 `NEXT_PUBLIC_API_BASE_URL=https://api.bio-spring.top`
- 本地无可用后端，开发环境也连接 `api.bio-spring.top`

## Project Division

Bio Spring 生态由三个项目组成：

| Project | Role | Responsibility |
|---------|------|----------------|
| `api.bio-spring.top` | 数据接口 | FastAPI 提供统一 REST API，所有前端共用 |
| `admin.bio-spring.top` | 运维后台 | 系统管理：用户、定时任务、数据库管理 |
| `app.bio-spring.top` | 业务前台 | 业务功能：LLM 用量分析、数字土壤、用户自助 |

**分工原则**：
- 运维级功能（用户管理、定时任务、数据库管理）仅放在 admin
- 业务数据和面向用户的功能放在 app
- api 作为统一数据层，不区分前端来源
- admin 和 app 共享相同的 API 信封格式、认证流程和 UI 组件模式，但各自独立维护

## Deployment

Push 到 GitHub 后通过 `webhook.bio-spring.top` 自动部署，部署配置详见 `../webhook.bio-spring.top` 项目。

## Related Projects

所有项目位于 `~/GitHub/gaospecial/bio-spring.top/` 下：

| Project | Description |
|---------|-------------|
| `../api.bio-spring.top` | FastAPI 后端 API，统一数据接口 |
| `../admin.bio-spring.top` | 运维后台（用户管理、定时任务、数据库管理） |
| `../webhook.bio-spring.top` | GitHub webhook 自动部署服务 |

联调时参考 `../api.bio-spring.top` 的接口定义确保类型和请求路径一致。

# Bio Spring 综合业务管理平台

app.bio-spring.top — 基于 Next.js 14 的多模块业务管理系统。

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| LLM 用量管理 | `/llm-usage/*` | API KEY 管理、用量统计、图表分析 |
| 数字土壤 | `/digital-soil/*` | 传感器管理、时序数据查询（开发中） |
| 考勤管理 | `/attendance/*` | 员工、打卡记录、考勤规则（开发中） |

管理员可通过用户管理页面（`/admin/users`）为用户分配模块访问权限。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v3.4
- **图表**: ECharts (echarts-for-react)
- **HTTP**: Axios
- **后端**: api.bio-spring.top (FastAPI)

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                          # 根布局
│   ├── page.tsx                            # 根页面 → 重定向到模块
│   ├── login/page.tsx                      # 登录页
│   └── (authenticated)/
│       ├── layout.tsx                      # 认证布局 (Sidebar + Header)
│       ├── page.tsx                        # 自动跳转到首个可用模块
│       ├── llm-usage/
│       │   ├── dashboard/page.tsx          # 用量总览
│       │   ├── keys/page.tsx               # API KEY 管理
│       │   ├── usage/page.tsx              # 用量图表
│       │   └── details/page.tsx            # 明细查询
│       ├── digital-soil/dashboard/page.tsx  # 数字土壤（占位）
│       ├── attendance/dashboard/page.tsx    # 考勤管理（占位）
│       └── admin/users/page.tsx            # 用户与模块权限管理
├── components/
│   ├── layout/
│   │   ├── Header.tsx                      # 顶部导航 (模块 tabs + 用户信息)
│   │   └── Sidebar.tsx                     # 侧边栏 (当前模块子导航)
│   ├── charts/                             # ECharts 图表组件
│   ├── dashboard/                          # 仪表盘组件
│   ├── details/                            # 明细查询组件
│   ├── keys/                               # API KEY 管理组件
│   └── ui/                                 # 通用 UI 组件
├── hooks/
│   └── useAuth.ts                          # 认证 hook
├── lib/
│   ├── api.ts                              # API 调用封装 (Axios)
│   ├── auth.ts                             # Token 管理 (localStorage)
│   ├── moduleRegistry.ts                   # 模块注册表
│   └── types.ts                            # TypeScript 类型定义
└── providers/
    └── AuthProvider.tsx                     # 认证 Context Provider
```

## 架构说明

### 路由结构

使用 Next.js App Router 的 Route Group `(authenticated)` 包裹所有需登录的页面。布局组件 `Sidebar` + `Header` 只在认证页面内渲染，登录页等公共页面不受影响。

### 认证流程

1. 用户登录 → 获取 JWT token → 存入 localStorage
2. `AuthProvider` 初始化时检查 token，调用 `/api/v1/auth/me` 获取用户信息（含模块权限）
3. `(authenticated)/layout.tsx` 客户端检查登录状态，未登录重定向到 `/login`
4. `app/page.tsx`（服务端组件）直接 redirect 到模块路由，不参与认证判断

### 模块权限

- 后端：`user_modules` 表记录用户可访问的模块，`require_module` 依赖工厂进行路由级权限校验
- 前端：`MODULE_REGISTRY` 定义所有模块，根据 `user.modules` 过滤显示
- admin 角色自动拥有所有模块访问权限

### 布局

- **Header**: 模块 tab 切换 + 用户管理入口（admin）+ 用户名 + 退出
- **Sidebar**: 当前模块的子导航（如 Dashboard、API Keys、用量图表等）

## 开发

```bash
npm install
npm run dev          # localhost:3000
npm run build        # 构建
```

### 环境变量

```env
NEXT_PUBLIC_API_BASE_URL=https://api.bio-spring.top
```

## 新增模块

1. 在后端 `core/` 下创建模块目录，添加 router 并使用 `require_module("module-id")` 保护
2. 在后端 `core/auth/models.py` 的 `ModuleId` 枚举中注册新模块 ID
3. 在前端 `src/lib/moduleRegistry.ts` 的 `MODULE_REGISTRY` 中添加模块定义（id、label、icon、defaultRoute、navItems）
4. 在前端 `src/app/(authenticated)/` 下创建对应路由目录

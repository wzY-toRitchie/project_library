# 更新日志 (Changelog)

本项目的所有重要更改都将记录在此文件中。

## [Unreleased] - 2026-02-12

### ✨ 新增功能 (Features)

- **后台图书管理增强**:
  - 新增 **图书封面上传** 功能，支持图片预览与自动回填。
  - 新增 **库存批量导入** 功能，支持 CSV/JSON 格式数据解析与更新。
  - 新增 **低库存预警联动**，基于系统设置的阈值动态展示库存状态。
- **UI 全面升级**:
  - 登录与注册页面重构，采用现代化卡片式设计，并完全中文化。
  - 引入 **Tailwind CSS** (v3.4) 替换原有样式体系，实现更现代化的响应式设计。
  - 首页 (`Home.tsx`)、购物车 (`Cart.tsx`) 及结算页 (`Checkout.tsx`) 全新 UI 实现。
- **国际化 (i18n)**:
  - 全站界面文案已本地化为**简体中文**。
- **购物车增强**:
  - 新增购物车商品**多选结算**功能。
  - 实时计算选中商品总价。
- **订单结算流程**:
  - 新增独立的**订单结算页面** (`/checkout`)。
  - 实现了基于 Jackson 的双向引用处理 (`@JsonManagedReference` / `@JsonBackReference`)，解决了订单提交时的序列化错误。
  - 集成多种支付方式 UI (银行卡、微信、货到付款)。

### 🐛 修复 (Bug Fixes)

- **前端类型修复**:
  - 修复了 `AdminBooks.tsx` 中的 `any` 类型警告，完善了 `Book` 和 `Category` 类型定义。
- **CORS 严格模式**:
  - 修复了带凭证请求 (Credentials) 的跨域问题，后端明确指定允许源为 `http://localhost:5173`。
- **CSS 加载错误**:
  - 解决了 Tailwind v4.0 与当前构建环境不兼容导致的 `net::ERR_ABORTED` 问题，回退至 v3.4.17 稳定版。
- **JSON 序列化递归**:
  - 修复了 `Order` 和 `OrderItem` 实体循环引用导致的 `StackOverflowError`。

## [Released] - 2026-01-22

### ✨ 新增功能 (Features)

- **后端鉴权体系**:
  - 实现了基于 Spring Security 和 JWT 的完整认证流程。
  - 新增 `/api/auth/signup` (注册) 和 `/api/auth/signin` (登录) 接口。
  - 添加 `AuthTokenFilter` 用于解析请求头中的 JWT Token。
  - 添加 `AuthEntryPointJwt` 处理未授权访问异常。
- **前端鉴权集成**:
  - 更新 `AuthContext` 以支持存储 Access Token 和用户角色。
  - 封装 Axios 拦截器 (`src/api/index.ts`)，自动在请求头中注入 `Authorization: Bearer <token>`。
  - 注册和登录页面对接新的后端 Auth 接口。
- **数据初始化**:
  - `DataInitializer` 更新：自动创建默认管理员和普通用户，密码经过 BCrypt 加密。

### 🐛 修复 (Bug Fixes)

- **前端白屏修复**:
  - 修复了 `AuthContext` 和 `CartContext` 中 `JSON.parse` 处理 `localStorage` 数据时的潜在崩溃问题（添加 try-catch）。
- **TypeScript 类型错误**:
  - 修复了 `SyntaxError: The requested module ... does not provide an export named 'Book'`。
  - 将所有接口导入语句从 `import { Book }` 修正为 `import type { Book }`，符合 Vite/ESModule 规范。
- **后端编译错误**:
  - 修复了 `SecurityConfig` 中找不到 `UserDetailsServiceImpl` Bean 的问题。
  - 修复了 `UserController` 中的残留语法错误。
- **CORS 配置**:
  - 更新后端 `WebConfig`，显式允许来自 `http://localhost:5173` 的跨域请求。

### ♻️ 重构 (Refactor)

- **UI 组件升级**:
  - 移除了 Ant Design 已弃用的 `List` 组件。
  - 使用 `Row` 和 `Col` 栅格系统重写了首页图书列表，保持了响应式布局，并优化了加载状态（Spin 组件）。

### 📝 文档 (Documentation)

- 新增 `README.md`：包含项目介绍、技术栈、启动指南和默认账号信息。
- 新增 `CHANGELOG.md`：记录项目更新历史。

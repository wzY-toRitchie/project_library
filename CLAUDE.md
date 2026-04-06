# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

线上书店系统（毕业设计）- 基于 Spring Boot 3 + React 19 的全栈电商应用，包含用户购书全流程与后台管理。

## 环境要求

- JDK 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

## 常用命令

### 后端
```bash
cd backend
mvn spring-boot:run       # 启动后端 (端口 8080)
mvn clean package          # 构建 JAR
mvn test                   # 运行测试
mvn test -Dtest=类名       # 运行单个测试类
```

### 前端
```bash
cd frontend
npm install                # 安装依赖
npm run dev                # 启动开发服务器 (端口 5173)
npm run build              # 生产构建
npm run lint               # ESLint 检查
npm run test               # 运行 Vitest
npm run test -- --run      # 单次运行（不监听）
```

## 架构

### 后端 (Spring Boot 3.2.2)
```
backend/src/main/java/com/bookstore/
├── config/           # 配置类 (Security, Web, Swagger, DataInitializer, AiConfig, AlipayConfig)
├── controller/       # 19 个 REST API 控制器
├── entity/           # 14 个 JPA 实体
├── repository/       # 13 个 Spring Data JPA 仓库
├── service/          # 16 个业务逻辑层
├── security/         # JWT 认证 (AuthTokenFilter, JwtUtils, AuthEntryPointJwt) + OAuth2 + SecurityUtils
├── payload/          # Request/Response DTO
├── exception/        # 全局异常处理 (GlobalExceptionHandler + 自定义异常)
├── enums/            # 枚举定义 (OrderStatus, NotificationType)
└── utils/            # 工具类
```

- **认证**: JWT 无状态认证 (AuthTokenFilter) + Spring Security，支持登录失败锁定
- **第三方登录**: 支持 GitHub、Gitee OAuth2 登录
- **AI 推荐**: OpenRouter 大语言模型集成 (AiConfig)
- **支付**: 支付宝 SDK 集成，支持电脑网站支付（沙箱环境）
- **密码**: BCrypt 加密
- **API 文档**: Swagger/OpenAPI (`/swagger-ui/index.html`)
- **数据初始化**: 首次启动自动初始化示例数据 (DataInitializer)，包含 10 个用户、10 个分类、45+ 本图书和 9 个示例订单

### 前端 (React 19 + TypeScript + Vite 7 + Ant Design)
```
frontend/src/
├── api/             # Axios 封装 + 各模块 API
├── components/      # 公共组件
│   ├── charts/      # 图表组件 (echarts-for-react)
│   ├── home/        # 主页板块组件
│   └── profile/     # 个人中心子组件
├── context/         # React Context (Auth, Cart)
├── pages/           # 页面组件（路由懒加载）
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

- **样式**: Tailwind CSS + Editorial 杂志风格 (Playfair Display + DM Sans)
- **状态**: React Context API (Auth, Cart)
- **路由**: React Router v7

## 核心 API

| 接口 | 说明 |
|------|------|
| `POST /api/auth/signup` | 用户注册 |
| `POST /api/auth/signin` | 登录 (返回 JWT) |
| `POST /api/auth/oauth2/*` | OAuth2 第三方登录 |
| `POST /api/ai/recommend` | AI 智能荐书 |
| `GET /api/books` | 图书列表 (分页) |
| `GET /api/books/{id}` | 图书详情 |
| `GET /api/cart` | 购物车 |
| `POST /api/orders` | 创建订单 |
| `GET /api/orders/user` | 用户订单 |
| `GET /api/dashboard/**` | 管理后台数据 (需 ADMIN) |

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `Admin@123` |
| 用户 | `user` | `User@1234` |

## 安全

- JWT 放在 Authorization 请求头: `Bearer <token>`
- 公开接口: `/api/auth/**`, `/api/books` (GET), `/api/categories` (GET), `/api/reviews` (GET), `/api/coupons` (GET), `/api/settings` (GET), `/api/uploads/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/error`
- 管理后台接口需 `ROLE_ADMIN` 权限（上传、图书 CRUD、分类、系统设置、导出、Dashboard）
- 登录失败锁定: `LoginAttemptService` 使用内存 Map 记录失败次数，达到上限后锁定指定时间
- `@EnableMethodSecurity` 已启用，支持 `@PreAuthorize` 注解
- 安全校验在控制器层手动通过 `SecurityUtils.isAdmin()` / `SecurityUtils.getCurrentUserUsername()` 执行

## OAuth2 配置

后端 `.env` 或 `application.properties` 配置:
```properties
# GitHub
spring.security.oauth2.client.registration.github.client-id=your-github-client-id
spring.security.oauth2.client.registration.github.client-secret=your-github-client-secret

# Gitee
spring.security.oauth2.client.registration.gitee.client-id=your-gitee-client-id
spring.security.oauth2.client.registration.gitee.client-secret=your-gitee-client-secret
```

前端配置 (`.env`):
```env
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITEE_CLIENT_ID=your-gitee-client-id
```

## AI 推荐配置

默认使用 Mock 模式。配置环境变量后启用真实 AI:
```properties
openrouter.api-key=your-api-key
openrouter.base-url=https://openrouter.ai/api/v1
openrouter.model=anthropic/claude-3-haiku
```

## 支付宝支付配置

支持电脑网站支付（沙箱环境）:
```properties
# 沙箱配置
app.alipay.app-id=your-app-id
app.alipay.private-key=your-private-key
app.alipay.alipay-public-key=alipay-public-key
app.alipay.gateway=https://openapi-sandbox.dl.alipaydev.com/gateway.do
app.alipay.sandbox=true
```

| 接口 | 说明 |
|------|------|
| `POST /api/payment/create/{orderId}` | 创建支付订单，返回支付表单 URL |
| `GET /api/payment/status/{orderId}` | 查询支付状态 |
| `POST /api/payment/notify` | 异步回调通知 |
| `POST /api/payment/refund/{orderId}` | 退款 |

## 开发注意事项

- 后端热重载: Spring DevTools
- 前端热重载: Vite HMR
- CORS 配置在 `WebConfig` + `SecurityConfig` 的默认 CorsFilter
- 全局异常处理在 `GlobalExceptionHandler`
- 订单创建使用 `bookRepository.decreaseStock()` 原子扣减库存防止超卖
- 上传图片路径依赖 `System.getProperty("user.dir")`，部署时需配置绝对路径
- `DataInitializer` 每次启动都会执行初始化数据检查，但没有 `@Profile("dev")` 保护
- `OrderItem` 使用 `@Data` Lombok 注解，`toString()` 和 `hashCode()` 可能因双向关系导致栈溢出

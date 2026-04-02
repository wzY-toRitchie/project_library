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
npm test -- --run          # 单次运行（不监听）
```

## 架构

### 后端 (Spring Boot 3.2.2)
```
backend/src/main/java/com/bookstore/
├── config/           # 配置类 (Security, Web, Swagger, DataInitializer)
├── controller/       # REST API 控制器
├── entity/           # JPA 实体
├── repository/       # Spring Data JPA 仓库
├── service/         # 业务逻辑层
├── security/        # JWT 认证授权 + OAuth2
├── payload/         # Request/Response DTO
├── exception/       # 全局异常处理
├── enums/           # 枚举定义
└── utils/           # 工具类
```

- **认证**: JWT 无状态认证 (AuthTokenFilter) + Spring Security
- **第三方登录**: 支持 GitHub、Gitee OAuth2 登录
- **AI 推荐**: OpenRouter 大语言模型集成
- **密码**: BCrypt 加密
- **API 文档**: Swagger/OpenAPI (`/swagger-ui/index.html`)
- **数据初始化**: 首次启动自动初始化示例数据

### 前端 (React 19 + TypeScript + Vite 7)
```
frontend/src/
├── api/             # Axios 封装 + 各模块 API
├── components/     # 公共组件
│   ├── charts/     # 图表组件
│   ├── home/       # 主页板块组件
│   └── profile/    # 个人中心子组件
├── context/        # React Context (Auth, Cart)
├── pages/          # 页面组件
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数
```

- **样式**: Tailwind CSS + Editorial 杂志风格 (Playfair Display + DM Sans)
- **状态**: React Context API (Auth, Cart)
- **路由**: React Router v6 (页面懒加载)

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
- 公开接口: `/api/auth/**`, `/api/books` (GET), `/api/categories` (GET), `/api/uploads/**`
- 管理后台接口需 `ROLE_ADMIN` 权限

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
| `POST /api/payment/create/{orderId}` | 创建支付订单 |
| `GET /api/payment/status/{orderId}` | 查询支付状态 |
| `POST /api/payment/notify` | 异步回调通知 |
| `POST /api/payment/refund/{orderId}` | 退款 |

## 开发注意事项

- 后端热重载: Spring DevTools
- 前端热重载: Vite HMR
- CORS 配置在 `WebConfig`
- 全局异常处理在 `GlobalExceptionHandler`
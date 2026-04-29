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
├── config/           # 7 个配置类 (AiConfig, AlipayConfig, DataInitializer, OAuth2ClientConfig, SecurityConfig, SwaggerConfig, WebConfig)
├── controller/       # 20 个 REST API 控制器
├── entity/           # 17 个 JPA 实体
├── repository/       # 16 个 Spring Data JPA 仓库
├── service/          # 18 个业务逻辑层 (含 EmailService)
├── security/         # JWT 认证 + OAuth2 + SecurityUtils
│   ├── jwt/          # AuthTokenFilter, JwtUtils, AuthEntryPointJwt
│   ├── oauth2/       # OAuth2 认证处理器和服务
│   └── services/     # UserDetailsImpl, UserDetailsServiceImpl
├── payload/          # Request/Response DTO (11 请求 + 13 响应)
├── exception/        # 全局异常处理 (GlobalExceptionHandler + 4 个自定义异常)
├── enums/            # 枚举定义 (OrderStatus, NotificationType)
└── utils/            # 工具类 (GeneratePasswords, LoginTest, PasswordTest)
```

- **认证**: JWT 无状态认证 (AuthTokenFilter) + Spring Security，支持登录失败锁定
- **第三方登录**: 支持 GitHub、Gitee OAuth2 登录
- **AI 推荐**: OpenRouter 大语言模型集成 (AiConfig)
- **支付**: 支付宝 SDK 集成，支持电脑网站支付（沙箱环境）
- **密码**: BCrypt 加密
- **API 文档**: Swagger/OpenAPI (`/swagger-ui/index.html`)
- **数据初始化**: 首次启动自动初始化示例数据 (DataInitializer)，包含 10 个用户、10 个分类、45+ 本图书和 9 个示例订单
- **优惠券系统**: 支持优惠券管理、积分兑换优惠券
- **积分系统**: 用户积分管理、积分规则配置、积分历史记录
- **浏览历史**: 用户浏览记录跟踪
- **通知系统**: 用户通知管理
- **收藏功能**: 用户收藏图书
- **评价系统**: 用户评价和评分

### 前端 (React 19.2.0 + TypeScript 5.9.3 + Vite 7.2.4 + Ant Design 6.2.1)
```
frontend/src/
├── api/             # 12 个 API 模块 (ai, alipaySandbox, coupons, dashboard, export, favorites, history, home, index, payment, points, search)
├── components/      # 41 个组件
│   ├── charts/      # 5 个图表组件 (echarts-for-react)
│   ├── home/        # 9 个主页板块组件
│   └── profile/     # 8 个个人中心子组件
├── context/         # React Context (AuthContext, CartContext)
├── pages/           # 33 个页面组件（路由懒加载）
├── test/            # 11 个测试文件
├── types/           # TypeScript 类型定义
└── utils/           # 5 个工具函数
```

- **样式**: Tailwind CSS 3.4.17 + Editorial 杂志风格 (Playfair Display + DM Sans)
- **状态**: React Context API (Auth, Cart)
- **路由**: React Router v7.12.0
- **图标**: Lucide React 0.562.0
- **图表**: ECharts 6.0.0

## 核心 API

| 接口 | 说明 |
|------|------|
| `POST /api/auth/signup` | 用户注册 (需验证码) |
| `POST /api/auth/signin` | 登录 (返回 JWT) |
| `POST /api/auth/send-code` | 发送邮箱验证码 |
| `POST /api/auth/oauth2/*` | OAuth2 第三方登录 |
| `POST /api/ai/recommend` | AI 智能荐书 |
| `GET /api/books` | 图书列表 (分页) |
| `GET /api/books/{id}` | 图书详情 |
| `GET /api/cart` | 购物车 |
| `POST /api/orders` | 创建订单 |
| `GET /api/orders/user` | 用户订单 |
| `GET /api/dashboard/**` | 管理后台数据 (需 ADMIN) |
| `POST /api/coupons/**` | 优惠券管理 |
| `GET /api/points/**` | 积分系统 |
| `GET /api/favorites/**` | 收藏功能 |
| `GET /api/reviews/**` | 评价系统 |
| `GET /api/notifications/**` | 通知系统 |
| `GET /api/history/**` | 浏览历史 |
| `POST /api/payment/**` | 支付宝支付 |

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
- OAuth2 认证成功/失败处理器: `OAuth2AuthenticationSuccessHandler`, `OAuth2AuthenticationFailureHandler`
- OAuth2 账户服务: `OAuth2AccountService`, `OAuth2LoginSessionService`

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

## 邮件验证码配置

支持注册时邮箱验证码验证（QQ 邮箱 SMTP）:

```properties
# 验证码配置
app.email.mock=${EMAIL_MOCK:true}                          # Mock 模式开关
app.email.code-expiration-minutes=${EMAIL_CODE_EXPIRATION_MINUTES:5}  # 验证码有效期
app.email.send-interval-seconds=${EMAIL_SEND_INTERVAL_SECONDS:60}    # 发送间隔

# QQ 邮箱 SMTP（Mock=false 时生效）
spring.mail.host=${MAIL_HOST:smtp.qq.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
```

| 接口 | 说明 |
|------|------|
| `POST /api/auth/send-code` | 发送邮箱验证码 |
| `POST /api/auth/signup` | 用户注册(需验证码) |

Mock 模式下验证码固定为 `123456`，不发送真实邮件。

## 测试

### 后端测试

- 24 个测试类，覆盖控制器、服务、配置、实体映射、DTO 验证、安全和异常处理
- 使用 H2 内存数据库进行测试
- 测试框架: JUnit 5 + Mockito

### 前端测试

- 11 个测试文件，使用 Vitest + Testing Library
- Puppeteer 设计审计测试
- 测试文件位于 `frontend/src/test/`

## 开发注意事项

- 后端热重载: Spring DevTools
- 前端热重载: Vite HMR
- CORS 配置在 `WebConfig` + `SecurityConfig` 的默认 CorsFilter
- 全局异常处理在 `GlobalExceptionHandler`
- 订单创建使用 `bookRepository.decreaseStock()` 原子扣减库存防止超卖
- 上传图片路径依赖 `System.getProperty("user.dir")`，部署时需配置绝对路径
- `DataInitializer` 每次启动都会执行初始化数据检查，但没有 `@Profile("dev")` 保护
- `OrderItem` 使用 `@Data` Lombok 注解，`toString()` 和 `hashCode()` 可能因双向关系导致栈溢出
- 生产环境配置文件: `application-prod.properties`
- 前端 API 模块化组织，每个业务模块独立一个 API 文件

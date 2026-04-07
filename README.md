# 线上书店系统（毕业设计）

基于 Spring Boot 3 + React 19 的前后端分离在线书店系统，覆盖用户购书全流程与后台管理全链路。内置 AI 智能荐书、积分优惠券系统、支付宝沙箱支付、Editorial 杂志风格 UI 设计，支持前台与后台完整演示。

## 技术栈

### 后端

| 类别 | 技术 |
|------|------|
| 核心框架 | Spring Boot 3.2.2 (Java 21) |
| 安全鉴权 | Spring Security + JWT (无状态) |
| 持久层 | Spring Data JPA (Hibernate) |
| 数据库 | MySQL 8.0 |
| API 文档 | Springdoc OpenAPI (Swagger UI) |
| 工具库 | Lombok, JJWT, Jackson |

### 前端

| 类别 | 技术 |
|------|------|
| 核心框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| 样式框架 | Tailwind CSS 3.4 + PostCSS |
| UI 组件 | Ant Design + Lucide React (图标) |
| 图表 | ECharts (echarts-for-react) |
| 状态管理 | React Context API (Auth & Cart) |
| 路由 | React Router v7 (React.lazy 懒加载) |
| HTTP 客户端 | Axios (JWT 拦截器 + token 缓存) |
| 字体 | Playfair Display (标题) + DM Sans (正文) |

## 快速开始

### 环境要求

- JDK 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### 1. 数据库配置

创建数据库：
```sql
CREATE DATABASE online_bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改 `backend/src/main/resources/application.properties` 中的数据库账号密码，或设置环境变量：`DB_URL`、`DB_USERNAME`、`DB_PASSWORD`、`JWT_SECRET`、`JWT_EXPIRATION_MS`。

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端运行在 `http://localhost:8080`，API 文档访问 `http://localhost:8080/swagger-ui/index.html`。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`。

## 默认账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | `admin` | `Admin@123` | 完整后台管理权限 |
| 普通用户 | `user` | `User@1234` | 仅限浏览和购买 |

激活 `dev` profile 时系统自动初始化示例数据，包含用户、分类、图书和示例订单。

## 功能模块

### 用户端

- **用户认证**: 注册、登录、JWT 无状态鉴权、密码 BCrypt 加密、登录失败自动锁定
- **图书浏览**: 首页推荐、分类筛选、关键词搜索+搜索建议、热搜、排序、分页
- **图书详情**: 评分评价、收藏夹、相关推荐
- **购物车**: 增删改数量、实时总价、localStorage + 后端同步（登录用户自动同步）
- **订单结算**: 收货地址选择、优惠券抵扣、订单创建（原子扣减库存防超卖）
- **订单管理**: 历史订单、状态跟踪、取消订单（含原因）、再次购买
- **个人中心**: 资料编辑、头像上传、密码修改、多地址管理（含默认地址）
- **积分系统**: 每日签到领积分、积分明细、积分兑换优惠券、管理员可手动调整积分
- **优惠券**: 积分兑换优惠券、三种类型（满减/折扣/包邮）、下单时自动计算优惠
- **收藏夹**: 图书收藏/取消、数量统计、批量清空
- **浏览历史**: 自动记录浏览、最近浏览、浏览量统计、单项/全部清除
- **消息通知**: 系统通知列表、一键全部已读
- **AI 智能荐书**: 基于 OpenRouter 大语言模型，对话式交互，返回图书推荐列表含匹配度和推荐理由，支持 API 连接测试；未配置 API Key 时默认 Mock 模式
- **支付宝支付**: 沙箱环境电脑网站支付，支持创建支付、查询状态、异步回调、关闭订单、退款
- **深色模式**: 亮色/暗色主题切换
- **作者详情页**: 按作者维度展示其所有图书
- **分类浏览页**: 带图标的分类快捷入口

### 管理端

- **数据仪表盘**: 销售趋势、订单状态分布、热销商品、分类销售占比、用户增长趋势图表，待办事项统计
- **图书管理**: 增删改查、封面上传（jpg/png/gif/webp，最大 5MB）、库存预警、编辑精选标记、CSV 导出
- **订单管理**: 状态更新（支持批量）、搜索筛选、订单详情、CSV 导出
- **用户管理**: 角色分配、资料编辑、CSV 导出
- **分类管理**: 增删改查
- **优惠券管理**: 创建/编辑/删除优惠券、设置积分兑换规则、查看所有/用户优惠券
- **积分规则管理**: 签到/购买/评价/注册等场景的积分规则配置
- **评价管理**: 查看全部图书评价、删除不当评论
- **系统设置**: 店铺信息、客服联系方式、AI 配置（API Key/模型/基础 URL/温度/最大 Tokens/系统提示词）、统计周期、低库存阈值（所有设置公开可读，仅管理员可修改）
- **数据导出**: 订单、用户、图书 CSV 导出（UTF-8 编码，防 Excel 公式注入）

### 首页板块

- 热门分类快捷入口
- 新书上架（横向滚动）
- 编辑精选（管理员标记）
- 好评榜 + 热销榜（双栏并排）
- 阅读统计（已购/收藏/已评数据）
- 热门作者（按评价排名）
- 猜你喜欢（AI 推荐）
- 最近浏览记录
- 优惠券领取侧边栏
- 每日签到入口
- 信任标识栏（正品保障/7 天退换/满 9 包邮/积分兑换）

## 环境变量

### 后端

| 变量名 | 说明 | 默认值 (开发环境) |
|--------|------|-------------------|
| `DB_URL` | MySQL 连接地址 | `jdbc:mysql://localhost:3306/online_bookstore?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `1234` |
| `JWT_SECRET` | JWT 签名密钥 | `devSecretKey123456789012345678901234` |
| `JWT_EXPIRATION_MS` | Token 有效期 | `86400000` (24 小时) |
| `LOGIN_MAX_ATTEMPTS` | 登录锁定阈值 | `5` |
| `LOGIN_LOCK_DURATION` | 锁定时长 (分钟) | `15` |
| `CORS_ALLOWED_ORIGINS` | 允许的跨域来源 | `http://localhost:5173,http://localhost:5174,http://localhost:3000` |
| `OPENROUTER_API_KEY` | OpenRouter API 密钥 (AI 荐书) | 空 (启用真实 AI) |
| `OPENROUTER_MODEL` | AI 模型 | `openrouter/free` (默认), `anthropic/claude-3-haiku` |

### 前端

| 变量名 | 说明 |
|--------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 |

## API 接口

### 认证

| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `/api/auth/signup` | 用户注册（密码强度校验：8 位以上，含大写、小写、数字） |
| POST | `/api/auth/signin` | 登录（返回 JWT + 用户信息） |

### 图书

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/books` | 公开（分页+排序） |
| GET | `/api/books/{id}` | 公开 |
| GET | `/api/books/category/{categoryId}` | 公开 |
| GET | `/api/books/search` | 公开 |
| GET | `/api/books/search/suggestions` | 公开 |
| GET | `/api/books/search/hot` | 公开 |
| POST | `/api/books` | 管理员 |
| PUT | `/api/books/{id}` | 管理员 |
| DELETE | `/api/books/{id}` | 管理员 |

### 订单

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/orders/my` | 登录用户 |
| GET | `/api/orders/{id}` | 登录用户 |
| POST | `/api/orders` | 登录用户 |
| PATCH | `/api/orders/{id}/status` | 登录用户 |
| DELETE | `/api/orders/{id}` | 登录用户 |
| POST | `/api/orders/{id}/cancel` | 登录用户 |
| POST | `/api/orders/batch/status` | 管理员 |
| GET | `/api/orders` | 管理员（分页） |

### 购物车

| 方法 | 接口 |
|------|------|
| GET | `/api/cart` |
| POST | `/api/cart` (参数: bookId, quantity) |
| PUT | `/api/cart/{bookId}` (参数: quantity) |
| DELETE | `/api/cart/{bookId}` |
| DELETE | `/api/cart` (清空) |

### 分类

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/categories` | 公开 |
| POST/PUT/DELETE | `/api/categories/**` | 管理员 |

### 支付

| 方法 | 接口 |
|------|------|
| POST | `/api/payment/create/{orderId}` |
| GET | `/api/payment/status/{orderId}` |
| POST | `/api/payment/notify` |
| POST | `/api/payment/close/{orderId}` |
| POST | `/api/payment/refund/{orderId}` |

### AI 推荐

| 方法 | 接口 |
|------|------|
| POST | `/api/ai/recommend` |
| POST | `/api/ai/test-connection` |

### 收藏

| 方法 | 接口 |
|------|------|
| GET | `/api/favorites` |
| POST | `/api/favorites/{bookId}` |
| POST | `/api/favorites/toggle/{bookId}` |
| DELETE | `/api/favorites/{bookId}` |
| DELETE | `/api/favorites` |

### 优惠券

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/coupons` | 公开 |
| GET | `/api/coupons/my` | 登录用户 |
| GET | `/api/coupons/available` | 登录用户 |
| POST | `/api/coupons/{id}/claim` | 登录用户 |
| POST | `/api/coupons/{id}/redeem` | 登录用户（积分兑换） |
| POST | `/api/coupons/apply` | 登录用户 |
| GET | `/api/coupons/admin` | 管理员 |
| POST/PUT/DELETE | `/api/coupons/**` | 管理员 |

### 积分

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/points` | 登录用户 |
| GET | `/api/points/history` | 登录用户 |
| POST | `/api/points/sign-in` | 登录用户 |
| GET | `/api/points/sign-in/status` | 登录用户 |
| GET | `/api/points/rules` | 管理员 |
| PUT | `/api/points/rules/{key}` | 管理员 |
| POST | `/api/points/adjust` | 管理员 |

### 浏览历史

| 方法 | 接口 |
|------|------|
| GET | `/api/history/recent` |
| POST | `/api/history/{bookId}` |
| DELETE | `/api/history/{bookId}` |
| DELETE | `/api/history` |

### 首页

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/home/all` | 公开 |
| GET | `/api/home/bestsellers` | 公开 |
| GET | `/api/home/new-arrivals` | 公开 |
| GET | `/api/home/top-rated` | 公开 |
| GET | `/api/home/featured` | 公开 |
| GET | `/api/home/categories` | 公开 |

### 仪表盘（管理员）

| 方法 | 接口 |
|------|------|
| GET | `/api/dashboard/summary` |
| GET | `/api/dashboard/sales-trend` |
| GET | `/api/dashboard/order-status` |
| GET | `/api/dashboard/top-products` |
| GET | `/api/dashboard/category-sales` |
| GET | `/api/dashboard/user-growth` |
| GET | `/api/dashboard/todos` |

### 其他

| 方法 | 接口 | 权限 |
|------|------|------|
| GET | `/api/reviews/book/{bookId}` | 公开 |
| POST | `/api/reviews` | 登录用户 |
| DELETE | `/api/reviews/{id}` | 管理员 |
| GET/POST/PUT/DELETE | `/api/users/addresses/**` | 登录用户 |
| GET/PUT | `/api/settings` | 公开/仅管理员修改 |
| POST | `/api/uploads/books` | 管理员 |
| GET | `/api/notifications` | 登录用户 |
| POST | `/api/notifications/mark-read` | 登录用户 |
| GET | `/api/export/orders` | 管理员 |
| GET | `/api/export/users` | 管理员 |
| GET | `/api/export/books` | 管理员 |

## 目录结构

```
project_library/
├── backend/                                # Spring Boot 后端
│   └── src/main/java/com/bookstore/
│       ├── config/                         # 配置类 (Security, Web, Swagger, AI, 支付宝, 数据初始化)
│       ├── controller/                     # 20 个 REST API 控制器
│       ├── entity/                         # 17 个 JPA 实体
│       ├── repository/                     # 16 个 Spring Data JPA 仓库
│       ├── service/                        # 17 个业务逻辑服务
│       ├── security/                       # JWT 认证 (过滤器, Jwt 工具, OAuth2 用户信息)
│       ├── payload/                        # 请求/响应 DTO
│       ├── exception/                      # 全局异常处理 + 自定义异常
│       ├── enums/                          # 枚举 (订单状态, 通知类型)
│       └── utils/                          # 工具类
│   └── src/main/resources/
│       ├── application.properties          # 开发环境配置 (auto-DDL update, CORS, 环境变量)
│       └── application-prod.properties     # 生产环境配置 (validate DDL, HikariCP, 外部环境变量)
│
├── frontend/                               # React 前端
│   ├── src/api/                            # Axios 实例 + 各模块 API
│   ├── src/components/
│   │   ├── charts/                         # ECharts 图表组件 (销售趋势/状态/增长等)
│   │   ├── home/                           # 首页板块组件
│   │   └── profile/                        # 个人中心子组件
│   ├── src/context/                        # React Context (Auth, Cart)
│   ├── src/pages/                          # 30+ 页面组件 (React.lazy 懒加载)
│   ├── src/types/                          # TypeScript 类型
│   └── src/utils/                          # 工具函数 (日期格式化, 密码校验)
│   ├── .env                                # 开发环境变量
│   ├── .env.production                     # 生产环境变量 (需反向代理)
│   ├── tailwind.config.js                  # Tailwind CSS 配置
│   └── vite.config.ts                      # Vite 7 配置
│
├── database/
│   ├── schema.sql                          # 建表脚本
│   └── data.sql                            # 示例数据脚本
│
└── README.md                               # 项目说明
```

## 前端路由

### 用户页面

| 路由 | 页面 |
|------|------|
| `/` | 首页 |
| `/login` | 登录 |
| `/register` | 注册 |
| `/cart` | 购物车 |
| `/checkout` | 结算 |
| `/book/:id` | 图书详情 |
| `/profile` | 个人中心 |
| `/payment/:id` | 支付页面 |
| `/payment-return` | 支付返回 |
| `/order-confirm` | 订单确认 |
| `/order-detail/:id` | 订单详情 |
| `/contact` | 客服支持 |
| `/search` | 搜索结果 |
| `/ai-recommend` | AI 荐书 |
| `/new-arrivals` | 新书上架 |
| `/hot-rankings` | 热销排行 |
| `/category` | 全部分类 |
| `/category/:id` | 分类浏览 |
| `/author/:name` | 作者详情 |
| `/about` | 关于 |
| `/legal` | 法律声明 |
| `/faq` | 常见问题 |
| `/oauth/callback` | OAuth 回调 |

### 管理后台（需 ROLE_ADMIN）

| 路由 | 页面 |
|------|------|
| `/admin` | 仪表盘 |
| `/admin/books` | 图书管理 |
| `/admin/categories` | 分类管理 |
| `/admin/orders` | 订单管理 |
| `/admin/users` | 用户管理 |
| `/admin/settings` | 系统设置 |
| `/admin/coupons` | 优惠券管理 |
| `/admin/points-rules` | 积分规则管理 |
| `/admin/reviews` | 评价管理 |

## 安全设计

- **JWT 认证**: HS256 签名，`Authorization: Bearer <token>` 请求头传递，前端 localStorage 存储
- **密码加密**: BCrypt + 注册强度校验（8 位以上，至少 1 大写 1 小写 1 数字）
- **登录锁定**: 内存 Map 记录，可配置失败次数阈值，达到上限后锁定指定时长
- **权限控制**: `@EnableMethodSecurity` + `@PreAuthorize("hasRole('ADMIN')")`，部分接口在控制器层手动校验
- **公开接口**: 认证、图书列表（GET）、分类（GET）、可用优惠券、系统设置（GET）、单本书评价、支付宝回调、Swagger、错误处理
- **登录接口**: 其余非管理接口需登录
- **管理接口**: 上传上传、图书增删改、分类增删改、设置修改、导出、仪表盘、订单列表、管理员优惠券、评价删除、积分规则管理/调整

## 配置说明

- **数据初始化**: `DataInitializer` 受 `@Profile("dev")` 保护，仅在 dev profile 激活时运行
- **CORS**: WebConfig + SecurityConfig 双重配置，支持多开发端口
- **上传路径**: 开发环境使用 `{user.dir}/uploads`，生产环境为 `/var/www/bookstore/uploads`
- **库存安全**: `BookRepository.decreaseStock()` 原子扣减，防止超卖
- **图书实体**: `@Version` 乐观锁，`@PrePersist`/`@PreUpdate` 自动维护时间戳
- **购物车**: 未登录存 localStorage，登录后自动同步，乐观更新 + 失败回滚
- **生产模式**: JPA DDL 改为 `validate`，HikariCP 连接池（最大 20，最小空闲 5），强制外部 JWT_SECRET 和 DB_PASSWORD 环境变量

## 支付宝沙箱配置

- App ID: `9021000162653792`
- 网关: `https://openapi-sandbox.dl.alipaydev.com/gateway.do`
- 签名方式: RSA2
- 支付回调: `http://localhost:5173/payment/return`

## 注意事项

- 后端 DevTools 热重载：`mvn spring-boot:run` 支持
- 前端 Vite HMR：`npm run dev` 自动热更新
- 所有页面使用 `React.lazy` + `Suspense` 实现代码分割
- 购物车状态使用 `useMemo` 优化派生状态（总价、数量）
- JWT Token 使用模块级缓存避免重复生成
- 订单创建使用原子 SQL 扣减库存，而非先查询再更新
- `SystemSetting` 实体支持管理员在线配置 AI 推荐参数

## 许可证

毕业设计项目，仅供学习交流使用。

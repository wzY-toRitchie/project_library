# Online Bookstore System (毕业设计 - 线上书店系统)

基于 Spring Boot 3 + React 19 的前后端分离在线书店系统，覆盖用户购书全流程与后台管理全链路。内置 AI 智能荐书、Editorial 杂志风格 UI 设计、丰富示例数据，支持前台与后台完整演示。

## 🛠 技术栈

### 后端 (Backend)

- **核心框架**: Spring Boot 3.2.2 (Java 21)
- **安全鉴权**: Spring Security + JWT (JSON Web Token)
- **持久层**: Spring Data JPA (Hibernate)
- **数据库**: MySQL 8.0
- **API 文档**: Springdoc OpenAPI (Swagger UI)
- **工具库**: Lombok, JJWT, Jackson

### 前端 (Frontend)

- **核心框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式框架**: Tailwind CSS 3.4 + PostCSS
- **设计系统**: Editorial 杂志风格
  - 标题字体: Playfair Display (衬线)
  - 正文字体: DM Sans (无衬线)
  - 主色调: 深藏蓝 `#1a365d` + 琥珀橙 `#c05621`
- **UI 组件**: Lucide React (图标), Ant Design (部分组件)
- **AI 集成**: OpenRouter API (大语言模型推荐)
- **状态管理**: React Context API (Auth & Cart)
- **路由**: React Router v6 (页面懒加载)
- **HTTP 客户端**: Axios (带 JWT 拦截器)

## 🚀 快速开始

### 1. 环境准备

- JDK 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### 2. 数据库配置

1. 创建数据库 `online_bookstore`：
   ```sql
   CREATE DATABASE online_bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. 修改后端配置文件 `backend/src/main/resources/application.properties` 中的数据库账号密码：
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 3. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务运行在 `http://localhost:8080`。

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端页面运行在 `http://localhost:5173`。

## 👤 默认账号

| 角色     | 用户名  | 密码       | 权限说明         |
| -------- | ------- | ---------- | ---------------- |
| 管理员   | `admin` | `Admin@123` | 拥有后台管理权限 |
| 普通用户 | `user`  | `User@1234` | 仅限浏览和购买   |

> 系统启动时自动初始化，包含 64 本示例图书、364 条评价、多种状态的订单及示例数据。

## ✨ 主要功能

### 用户端

- **用户认证**: 注册、登录、JWT 无状态鉴权、密码加密存储 (BCrypt)
- **AI 智能荐书**: 基于 OpenRouter 大语言模型，根据用户偏好和行为数据智能推荐图书，对话式交互界面
- **图书浏览**: 首页推荐、分类筛选、搜索、排序、分页
- **图书详情**: 评分、评价、收藏、浏览历史记录
- **购物车**: 多选结算、数量增减、实时总价计算
- **订单结算**: 收货地址选择、优惠券、多种支付方式
- **订单管理**: 历史订单、状态跟踪、时间线、再次购买
- **个人中心**: 资料编辑、头像上传、密码修改、多地址管理、积分签到、收藏夹、浏览历史、优惠券
- **深色模式**: 支持亮色/暗色主题切换

### 管理端

- **仪表盘**: 销售趋势、订单状态分布、热销商品、分类销售、用户增长
- **图书管理**: 增删改查、封面上传、库存管理、编辑精选标记、CSV/JSON 批量导入、低库存预警
- **订单管理**: 状态流转、搜索筛选、订单详情、数据导出
- **用户管理**: 角色切换、资料编辑、删除保护
- **分类管理**: 分类增删改查
- **系统设置**: 店铺信息、客服信息、统计周期配置

### 主页板块

- **热门分类入口**: 带图标的分类快捷入口
- **新书上架**: 横向滚动展示最新书籍
- **编辑精选**: 管理员标记的推荐书籍
- **好评榜 + 热销榜**: 2 列并排排行榜
- **阅读统计**: 已购/收藏/已评数据
- **热门作者**: 按评价排名的作者卡片
- **猜你喜欢**: AI 推荐书籍
- **最近浏览**: 用户浏览历史
- **优惠券领取**: 主页侧边栏可领取优惠券
- **每日签到**: 积分签到功能
- **信任标识栏**: 正品保障/7天退换/满9包邮/积分兑换

## 🎨 前端设计系统

- **字体**: Playfair Display (标题) + DM Sans (正文)
- **配色**: 深藏蓝 `#1a365d` / 琥珀橙 `#c05621` / 金色 `#d69e2e`
- **交互**: 统一按钮/卡片/输入框状态、骨架屏加载、空状态组件、fade-up/stagger 入场动画
- **无障碍**: aria-label/aria-hidden、focus-visible 样式、语义化 HTML、图片 width/height
- **性能**: 页面懒加载 (React.lazy)、内容可见性 (content-visibility)、transition 具体属性声明

## 🔗 API 接口

### 认证
- `POST /api/auth/signup` 注册
- `POST /api/auth/signin` 登录

### AI 推荐
- `POST /api/ai/recommend` AI 智能荐书

### 首页
- `GET /api/home/all` 首页聚合数据
- `GET /api/home/bestsellers` 热销榜
- `GET /api/home/new-arrivals` 新书上架
- `GET /api/home/top-rated` 好评榜
- `GET /api/home/featured` 编辑精选

### 图书
- `GET /api/books` 图书列表 (分页)
- `GET /api/books/{id}` 图书详情
- `POST /api/books` 新增图书 (管理员)
- `PUT /api/books/{id}` 编辑图书 (管理员)

### 购物车
- `GET /api/cart` 获取购物车
- `POST /api/cart/{bookId}` 添加到购物车
- `DELETE /api/cart/{bookId}` 移除商品

### 订单
- `POST /api/orders` 创建订单
- `GET /api/orders/user` 用户订单列表
- `PATCH /api/orders/{id}/status` 更新订单状态

### 收藏/历史/优惠券
- `GET/POST/DELETE /api/favorites` 收藏管理
- `GET/DELETE /api/history` 浏览历史
- `GET /api/coupons` 优惠券列表

### Swagger 文档
- `http://localhost:8080/swagger-ui/index.html`

## 📁 项目结构

```
project_library/
├── backend/                           # Spring Boot 后端
│   ├── src/main/java/com/bookstore
│   │   ├── config/                    # 配置类 (Security, Web, Swagger, AI)
│   │   ├── controller/                # API 控制器 (含 HomeController, AiRecommendationController)
│   │   ├── entity/                    # JPA 实体 (Book 含 featured, User 含 avatar)
│   │   ├── enums/                     # 枚举定义
│   │   ├── exception/                 # 全局异常处理
│   │   ├── payload/                   # 请求/响应 DTO
│   │   ├── repository/               # Spring Data JPA
│   │   ├── security/                  # JWT + Spring Security
│   │   ├── service/                   # 业务逻辑层 (含 AiRecommendationService)
│   │   └── utils/                     # 工具类
│   └── src/main/resources/
│       └── application.properties     # 应用配置 (含 OpenRouter AI 配置)
│
├── frontend/                          # React 前端
│   ├── src/
│   │   ├── api/                       # Axios 封装 + 各模块 API (含 ai.ts, home.ts)
│   │   ├── components/                # 公共组件
│   │   │   ├── charts/                # 图表组件
│   │   │   ├── home/                  # 主页板块组件 (8个新组件)
│   │   │   └── profile/               # 个人中心子组件 (Profile拆分后的5个组件)
│   │   ├── context/                   # React Context (Auth, Cart)
│   │   ├── pages/                     # 页面组件 (含 AiRecommend.tsx)
│   │   ├── types/                     # TypeScript 类型
│   │   └── utils/                     # 工具函数 (format.ts, password.ts)
│   ├── index.html                     # 入口 HTML
│   ├── tailwind.config.js             # Tailwind 配置
│   └── vite.config.ts                 # Vite 配置
│
├── database/                          # 数据库脚本
│   ├── schema.sql                     # 建表脚本
│   └── data.sql                       # 示例数据
│
└── README.md                          # 项目说明
```

## 📝 开发说明

- **后端热重载**: `mvn spring-boot:run` 支持 DevTools 热重载
- **前端热重载**: `npm run dev` 启用 Vite HMR
- **Swagger 文档**: 访问 `http://localhost:8080/swagger-ui/index.html` (需 JWT 认证)
- **数据库初始化**: 首次启动自动建表并插入示例数据 (DataInitializer)
- **页面懒加载**: 使用 React.lazy + Suspense 实现代码分割
- **AI 推荐**: 默认 Mock 模式，配置 `OPENROUTER_API_KEY` 环境变量后切换为真实大模型

## 🔄 本次更新 (2026-03-26)

### Bug 修复
- 修复 ReviewController detached entity 问题 (Book.version)
- 修复 37 个 TypeScript 编译错误 → 0 错误
- 修复 22 个 ESLint 错误 → 0 错误

### 架构优化
- Profile.tsx 从 1293 行拆分为 98 行 orchestrator + 5 个子组件
- 添加 Swagger API 文档注解 (6 个核心控制器)
- 页面懒加载 (React.lazy + Suspense)
- CartContext 使用 useMemo 优化派生状态
- JWT token 模块级缓存

### 新增功能
- AI 智能荐书 (OpenRouter 大语言模型集成)
- 主页丰富化 (8 个新板块: 热销榜/新书上架/编辑精选/好评榜/热门分类/阅读统计/热门作者/信任标识栏)
- 主页优惠券领取 + 签到积分
- 管理员编辑精选标记
- 用户头像上传/删除
- 结算页面地址跳转到个人中心

### Web Interface Guidelines 合规
- 46 个 transition-all → 具体属性
- 29 个 aria-label 添加
- 160+ 个 aria-hidden 添加
- 11 个 div onClick → Link
- 20+ 表单输入 name/autocomplete
- 17 张图片 width/height
- CSS color-scheme/touch-action 全局优化

## 📄 License

毕业设计项目，仅供学习交流使用。

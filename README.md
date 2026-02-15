# Online Bookstore System (毕业设计 - 线上书店系统)

这是一个基于现代化技术栈构建的前后端分离电子商务系统，覆盖用户购书全流程与后台管理全链路。面向答辩展示场景，系统内置丰富示例数据（用户、图书、订单与多种订单状态），支持前台与后台完整演示。

## 🛠 技术栈

### 后端 (Backend)

- **核心框架**: Spring Boot 3.2.2
- **安全鉴权**: Spring Security + JWT (JSON Web Token)
- **持久层**: Spring Data JPA (Hibernate)
- **数据库**: MySQL 8.0
- **工具库**: Lombok, JJWT, Jackson (解决双向引用问题)

### 前端 (Frontend)

- **核心框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式框架**: **Tailwind CSS** (v3.4) + PostCSS
- **UI 组件**: Lucide React (图标), Ant Design (部分组件兼容)
- **状态管理**: React Context API (Auth & Cart)
- **路由**: React Router v6
- **HTTP 客户端**: Axios (带拦截器封装)

## 🚀 快速开始

### 1. 环境准备

- JDK 17+
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

### 3. 初始化数据说明

- 系统启动时会自动创建表结构与示例数据。
- 示例数据包含 20 本书、多个用户、覆盖待支付/已支付/已发货/已完成/已取消的订单，以及示例收货地址。
- 若数据库已有历史数据，需清空相关表或重新建库后重启后端，以重新写入示例数据。

### 4. 启动后端

后端启动命令：

```bash
cd backend
mvn spring-boot:run
```

后端服务将运行在 `http://localhost:8080`。

### 5. 启动前端

前端启动命令：

```bash
cd frontend
npm install
npm run dev
```

前端页面将运行在 `http://localhost:5173`。

### 6. 编译与重启指南

当代码发生变更时，请参考以下步骤进行编译与重启：

**后端 (Backend)**

1. 停止当前运行的后端服务。
2. 进入后端目录，清理并重新打包：
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
3. 运行生成的 JAR 包：
   ```bash
   java -jar target/online-bookstore-0.0.1-SNAPSHOT.jar
   ```
   > 提示：如果遇到端口占用错误，请确保已关闭之前的 Java 进程，或手动终止占用 8080 端口的进程。

**前端 (Frontend)**

1. 进入前端目录：
   ```bash
   cd frontend
   ```
2. 重新构建（可选，用于检查构建错误）：
   ```bash
   npm run build
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
   > 提示：如果默认端口 5173 被占用，Vite 会自动切换到 5174 或更高端口，请查看控制台输出的访问地址。

## 👤 默认账号

系统初始化时会自动创建以下测试账号与示例用户：

| 角色     | 用户名    | 密码       | 权限说明         |
| -------- | --------- | ---------- | ---------------- |
| 管理员   | `admin`   | `admin123` | 拥有后台管理权限 |
| 管理员   | `manager` | `user123`  | 管理后台演示账号 |
| 普通用户 | `user`    | `user123`  | 仅限浏览和购买   |
| 普通用户 | `alice`   | `user123`  | 示例用户         |
| 普通用户 | `bob`     | `user123`  | 示例用户         |
| 普通用户 | `charlie` | `user123`  | 示例用户         |
| 普通用户 | `diana`   | `user123`  | 示例用户         |

## ✨ 主要功能

- **用户认证**: 完整的注册、登录流程，使用 JWT 进行无状态鉴权。
- **现代化 UI**:
  - 基于 Tailwind CSS 的全新首页设计。
  - **全新设计的登录与注册页面**，提供更优的用户体验。
  - 全中文界面支持。
  - 响应式布局，适配不同屏幕尺寸。
- **图书浏览**:
  - 首页推荐图书展示。
  - 支持按标题、作者搜索图书。
- **购物车系统**:
  - 支持多选商品进行结算。
  - 实时计算选中商品总价。
  - 数量增减与商品移除。
- **订单结算**:
  - 独立的结算页面 (Checkout)，支持查看收货地址、商品清单及支付方式选择。
  - 集成多种支付方式 UI (银行卡、微信支付、货到付款)。
- **订单管理**: 查看历史订单状态与订单详情。
- **收货地址管理**:
  - 支持多地址新增、编辑、删除与默认地址设置。
  - 后台用户管理展示默认地址与地址数量。
- **后台管理**:
  - **图书管理增强**：
    - 新增/编辑/删除与库存维护。
    - **支持图书封面上传**。
    - **支持库存批量导入 (CSV/JSON)**。
    - **低库存智能预警展示**。
  - 订单管理：状态流转、搜索筛选与订单详情弹窗。
  - 用户管理：角色切换、资料编辑与删除保护。
  - 系统设置：店铺信息、客服信息与仪表盘统计周期配置，后端落库并驱动仪表盘。
- **安全机制**:
  - 密码加密存储 (BCrypt)
  - 前端路由守卫
  - 统一 API 请求拦截 (自动携带 Token)
  - 解决 JSON 序列化循环引用问题 (@JsonManagedReference / @JsonBackReference)

## 🔗 关键接口

### 用户与认证

- `POST /api/users/register` 注册
- `POST /api/users/login` 登录
- `GET /api/users` 后台用户列表
- `GET /api/users/addresses` 当前用户地址列表
- `POST /api/users/addresses` 新增收货地址
- `PUT /api/users/addresses/{id}` 编辑收货地址
- `PUT /api/users/addresses/{id}/default` 设置默认地址
- `DELETE /api/users/addresses/{id}` 删除收货地址
- `PUT /api/users/{id}` 后台编辑用户资料
- `PATCH /api/users/{id}/role` 角色更新

### 图书与分类

- `GET /api/books` 图书列表
- `GET /api/categories` 分类列表
- `POST /api/books` 新增图书（管理员）
- `PATCH /api/books/{id}` 编辑图书（管理员）

### 订单

- `GET /api/orders` 后台订单列表
- `GET /api/orders/user/{userId}` 用户订单列表
- `PATCH /api/orders/{id}/status` 更新订单状态

### 系统设置

- `GET /api/settings` 获取系统设置
- `PUT /api/settings` 更新系统设置

## 📁 项目结构

```
project_library/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/com/bookstore
│   │   ├── config/          # 安全与Web配置 (CORS, Security)
│   │   ├── controller/      # API 控制器
│   │   ├── entity/          # 数据库实体 (User, Book, Order)
│   │   ├── repository/      # JPA 仓库
│   │   ├── security/        # JWT 实现
│   │   └── service/         # 业务逻辑
│   └── src/main/resources/  # 配置文件
│
└── frontend/                # React 前端
    ├── src/
    │   ├── api/             # Axios 封装
    │   ├── components/      # 公共组件 (MainLayout)
    │   ├── context/         # 全局状态 (Auth, Cart)
    │   ├── pages/           # 页面组件
    │   │   ├── Home.tsx     # 首页 (Tailwind 重构)
    │   │   ├── Cart.tsx     # 购物车 (支持多选)
    │   │   ├── Checkout.tsx # 结算页 (新功能)
    │   │   └── ...
    │   └── types/           # TypeScript 类型定义
    ├── tailwind.config.js   # Tailwind 配置
    └── postcss.config.js    # PostCSS 配置
```

# Online Bookstore System (毕业设计 - 线上书店系统)

这是一个基于现代化技术栈构建的前后端分离电子商务系统，旨在提供流畅的图书浏览、搜索、购买及订单管理体验。

## 🛠 技术栈

### 后端 (Backend)
- **核心框架**: Spring Boot 3.2.2
- **安全鉴权**: Spring Security + JWT (JSON Web Token)
- **持久层**: Spring Data JPA (Hibernate)
- **数据库**: MySQL 8.0
- **工具库**: Lombok, JJWT

### 前端 (Frontend)
- **核心框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 组件库**: Ant Design 5.x
- **状态管理**: React Context API (Auth & Cart)
- **路由**: React Router v6
- **HTTP 客户端**: Axios (带拦截器封装)
- **图标库**: Lucide React

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

### 3. 启动后端
```bash
cd backend
# 首次运行会自动创建表结构并初始化默认数据
./mvnw spring-boot:run
```
后端服务将运行在 `http://localhost:8080`。

### 4. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端页面将运行在 `http://localhost:5173`。

## 👤 默认账号

系统初始化时会自动创建以下测试账号：

| 角色 | 用户名 | 密码 | 权限说明 |
|------|--------|------|----------|
| 管理员 | `admin` | `admin123` | 拥有后台管理权限 |
| 普通用户 | `user` | `user123` | 仅限浏览和购买 |

## ✨ 主要功能

- **用户认证**: 完整的注册、登录流程，使用 JWT 进行无状态鉴权。
- **图书浏览**: 响应式网格布局展示图书，支持按标题搜索。
- **购物车**: 基于本地存储 (LocalStorage) 的购物车，支持商品增删改。
- **订单系统**: 下单流程及历史订单查看。
- **安全机制**: 
  - 密码加密存储 (BCrypt)
  - 前端路由守卫
  - 统一 API 请求拦截 (自动携带 Token)
  - 全局异常处理

## 📁 项目结构

```
project_library/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/com/bookstore
│   │   ├── config/          # 安全与Web配置
│   │   ├── controller/      # API 控制器
│   │   ├── entity/          # 数据库实体
│   │   ├── repository/      # JPA 仓库
│   │   ├── security/        # JWT 实现
│   │   └── service/         # 业务逻辑
│   └── src/main/resources/  # 配置文件
│
└── frontend/                # React 前端
    ├── src/
    │   ├── api/             # Axios 封装
    │   ├── context/         # 全局状态 (Auth, Cart)
    │   ├── pages/           # 页面组件
    │   └── types/           # TypeScript 类型定义
```

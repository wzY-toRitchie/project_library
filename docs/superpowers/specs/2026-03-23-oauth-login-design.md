# OAuth 第三方登录功能设计文档

> 日期: 2026-03-23
> 作者: opencode
> 状态: 已确认

## 1. 概述

为在线书店项目添加 OAuth 第三方登录功能，支持 GitHub、Google、Gitee、小米账号四种登录方式。

### 1.1 目标

- 提供便捷的第三方登录方式，降低用户注册门槛
- 利用 Spring Security OAuth2 Client 实现标准化的 OAuth2 流程
- 首次 OAuth 登录自动创建本地账户
- 与现有 JWT 认证体系无缝集成

### 1.2 OAuth 提供商

| 提供商 | 说明 | 开发者认证 |
|--------|------|-----------|
| GitHub | 技术圈常用，配置简单 | 免费，无需企业认证 |
| Google | 全球流行 | 免费，需 Google Cloud 账号 |
| Gitee | 中国版 GitHub，本土化好 | 免费，需实名认证 |
| 小米 | 国内用户基数大 | 需小米开放平台开发者认证 |

---

## 2. 架构设计

### 2.1 整体流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  Login Page                                                      │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │ 用户名/密码登录  │  │  其他登录方式                        │  │
│  │                 │  │  [GitHub] [Google] [Gitee] [小米]   │  │
│  └─────────────────┘  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ 点击 OAuth 按钮
                              ↓ 跳转到 /api/oauth2/authorization/{provider}
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                          │
├─────────────────────────────────────────────────────────────────┤
│  Spring Security OAuth2 Client                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ OAuth2AuthorizationRequestRedirectFilter                    ││
│  │ ↓ 重定向到 OAuth 提供商授权页面                              ││
│  │                                                             ││
│  │ OAuth2LoginAuthenticationFilter                             ││
│  │ ↓ 处理回调，获取授权码，换取 access_token                    ││
│  │                                                             ││
│  │ OAuth2UserServiceImpl (自定义)                               ││
│  │ ↓ 加载或创建本地用户                                        ││
│  │                                                             ││
│  │ OAuth2SuccessHandler (自定义)                                ││
│  │ ↓ 生成 JWT，重定向到前端                                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ 重定向到 http://localhost:5173/oauth/callback?token=xxx
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend - OAuthCallback                      │
│  解析 URL 参数 → 保存 JWT 到 localStorage → 跳转首页           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 时序图

```
用户          前端           后端          OAuth提供商
 │             │              │                │
 │  点击GitHub │              │                │
 │────────────>│              │                │
 │             │ GET /api/    │                │
 │             │ oauth2/      │                │
 │             │ authorization│                │
 │             │ /github      │                │
 │             │─────────────>│                │
 │             │              │                │
 │             │   302 Redirect                │
 │             │<─────────────│                │
 │             │              │                │
 │  重定向到GitHub授权页面     │                │
 │<────────────│              │                │
 │             │              │                │
 │  授权并同意  │              │                │
 │───────────────────────────────────────────>│
 │             │              │                │
 │             │   回调 /api/oauth2/callback/github?code=xxx
 │             │<─────────────────────────────│
 │             │              │                │
 │             │   用code换取access_token      │
 │             │─────────────────────────────>│
 │             │              │                │
 │             │   返回用户信息                │
 │             │<─────────────────────────────│
 │             │              │                │
 │             │   创建/查找本地用户           │
 │             │              │                │
 │             │   生成JWT                    │
 │             │              │                │
 │             │   302 Redirect to frontend?token=xxx
 │             │<─────────────│                │
 │  OAuthCallback页面         │                │
 │<────────────│              │                │
 │             │              │                │
 │  保存JWT，登录完成         │                │
 │             │              │                │
```

---

## 3. 数据库设计

### 3.1 User 表变更

```sql
ALTER TABLE users
ADD COLUMN provider VARCHAR(20) COMMENT 'OAuth提供商: github/google/gitee/xiaomi/local',
ADD COLUMN provider_id VARCHAR(100) COMMENT 'OAuth提供商用户ID',
ADD COLUMN avatar_url VARCHAR(500) COMMENT '用户头像URL',
MODIFY COLUMN password VARCHAR(255) NULL COMMENT '密码(OAuth用户为空)';

-- 添加联合唯一索引
ALTER TABLE users
ADD UNIQUE INDEX idx_provider_provider_id (provider, provider_id);
```

### 3.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| provider | VARCHAR(20) | 是 | OAuth 提供商标识：github/google/gitee/xiaomi/local |
| provider_id | VARCHAR(100) | 否 | OAuth 提供商返回的唯一用户 ID |
| avatar_url | VARCHAR(500) | 否 | 用户头像 URL（来自 OAuth 提供商） |
| password | VARCHAR(255) | 否 | 密码，OAuth 用户可为空 |

### 3.3 数据示例

```sql
-- 普通注册用户
INSERT INTO users (username, email, password, role, provider) VALUES
('localuser', 'local@example.com', '...', 'USER', 'local');

-- GitHub OAuth 用户
INSERT INTO users (username, email, provider, provider_id, avatar_url, role) VALUES
('github_user', 'github@example.com', 'github', '12345678', 'https://avatars.githubusercontent.com/u/12345678', 'USER');
```

---

## 4. 后端实现

### 4.1 依赖添加

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

### 4.2 配置文件

```properties
# application.properties

# OAuth2 - GitHub
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID:your-github-client-id}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET:your-github-secret}
spring.security.oauth2.client.registration.github.scope=read:user,user:email

# OAuth2 - Google
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:your-google-client-id}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:your-google-secret}
spring.security.oauth2.client.registration.google.scope=openid,profile,email

# OAuth2 - Gitee
spring.security.oauth2.client.registration.gitee.client-id=${GITEE_CLIENT_ID:your-gitee-client-id}
spring.security.oauth2.client.registration.gitee.client-secret=${GITEE_CLIENT_SECRET:your-gitee-secret}
spring.security.oauth2.client.registration.gitee.scope=user_info
spring.security.oauth2.client.registration.gitee.client-name=Gitee
spring.security.oauth2.client.registration.gitee.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.gitee.redirect-uri={baseUrl}/api/oauth2/callback/{registrationId}
spring.security.oauth2.client.provider.gitee.authorization-uri=https://gitee.com/oauth/authorize
spring.security.oauth2.client.provider.gitee.token-uri=https://gitee.com/oauth/token
spring.security.oauth2.client.provider.gitee.user-info-uri=https://gitee.com/api/v5/user
spring.security.oauth2.client.provider.gitee.user-name-property=id

# OAuth2 - 小米
spring.security.oauth2.client.registration.xiaomi.client-id=${XIAOMI_CLIENT_ID:your-xiaomi-client-id}
spring.security.oauth2.client.registration.xiaomi.client-secret=${XIAOMI_CLIENT_SECRET:your-xiaomi-secret}
spring.security.oauth2.client.registration.xiaomi.scope=1,2,3
spring.security.oauth2.client.registration.xiaomi.client-name=小米
spring.security.oauth2.client.registration.xiaomi.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.xiaomi.redirect-uri={baseUrl}/api/oauth2/callback/{registrationId}
spring.security.oauth2.client.provider.xiaomi.authorization-uri=https://account.xiaomi.com/oauth2/authorize
spring.security.oauth2.client.provider.xiaomi.token-uri=https://account.xiaomi.com/oauth/token
spring.security.oauth2.client.provider.xiaomi.user-info-uri=https://open.account.xiaomi.com/user/profile
spring.security.oauth2.client.provider.xiaomi.user-name-property=union_id

# OAuth2 前端回调地址
app.oauth2.redirect-uri=http://localhost:5173/oauth/callback
```

### 4.3 核心类

#### OAuth2UserServiceImpl

职责：处理 OAuth2 用户信息，查找或创建本地用户

```java
@Service
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        // 1. 调用父类获取 OAuth2 用户信息
        // 2. 根据 provider 提取 providerId、email、name、avatar
        // 3. 查找本地用户（按 provider + providerId）
        // 4. 不存在则创建新用户
        // 5. 返回 UserDetailsImpl
    }
}
```

#### OAuth2SuccessHandler

职责：OAuth2 登录成功后生成 JWT 并重定向到前端

```java
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    
    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Override
    public void onAuthenticationSuccess(...) {
        // 1. 从 Authentication 获取 UserDetailsImpl
        // 2. 使用 JwtUtils 生成 JWT
        // 3. 构建重定向 URL，携带 token、userId、username、email 参数
        // 4. 重定向到前端 OAuthCallback 页面
    }
}
```

#### SecurityConfig 修改

```java
http.oauth2Login(oauth2 -> oauth2
    .authorizationEndpoint(authorization -> authorization
        .baseUri("/api/oauth2/authorization"))
    .redirectionEndpoint(redirection -> redirection
        .baseUri("/api/oauth2/callback/*"))
    .userInfoEndpoint(userInfo -> userInfo
        .userService(oAuth2UserService))
    .successHandler(oAuth2SuccessHandler));
```

---

## 5. 前端实现

### 5.1 新增文件

| 文件 | 说明 |
|------|------|
| `components/OAuth2Buttons.tsx` | OAuth 登录按钮组件 |
| `pages/OAuthCallback.tsx` | OAuth 回调处理页面 |

### 5.2 OAuth2Buttons 组件

展示四个 OAuth 登录按钮，点击后跳转到后端 OAuth 授权端点。

```tsx
const OAuth2Buttons: React.FC = () => {
    const providers = [
        { id: 'github', name: 'GitHub', icon: 'github' },
        { id: 'google', name: 'Google', icon: 'google' },
        { id: 'gitee', name: 'Gitee', icon: 'gitee' },
        { id: 'xiaomi', name: '小米', icon: 'xiaomi' },
    ];
    
    const handleOAuthLogin = (providerId: string) => {
        window.location.href = `http://localhost:8080/api/oauth2/authorization/${providerId}`;
    };
    
    // 渲染按钮...
};
```

### 5.3 OAuthCallback 页面

处理 OAuth 回调，从 URL 参数中提取 JWT 和用户信息，保存到 localStorage。

```tsx
const OAuthCallback: React.FC = () => {
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // 保存用户信息到 localStorage
            // 调用 login() 更新 AuthContext
            // 跳转到首页
        } else {
            // 登录失败，跳转到登录页
        }
    }, []);
    
    return <div>正在登录...</div>;
};
```

### 5.4 修改文件

| 文件 | 修改内容 |
|------|----------|
| `pages/Login.tsx` | 添加 `<OAuth2Buttons />` 组件 |
| `App.tsx` | 添加 `/oauth/callback` 路由 |

---

## 6. 各提供商配置指南

### 6.1 GitHub

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: Online Bookstore
   - Homepage URL: http://localhost:5173
   - Authorization callback URL: http://localhost:8080/api/oauth2/callback/github
4. 获取 Client ID 和 Client Secret

### 6.2 Google

1. 访问 https://console.cloud.google.com
2. 创建项目，启用 Google+ API
3. 创建 OAuth 2.0 客户端 ID
4. 添加授权重定向 URI: http://localhost:8080/api/oauth2/callback/google

### 6.3 Gitee

1. 访问 https://gitee.com/oauth/applications
2. 创建应用
3. 填写回调地址: http://localhost:8080/api/oauth2/callback/gitee

### 6.4 小米

1. 访问 https://dev.mi.com
2. 创建应用，获取 AppID 和 AppSecret
3. 配置回调地址: http://localhost:8080/api/oauth2/callback/xiaomi

---

## 7. 文件变更清单

### 新增文件

| 文件路径 | 说明 |
|----------|------|
| `backend/.../security/oauth2/OAuth2UserServiceImpl.java` | OAuth2 用户加载服务 |
| `backend/.../security/oauth2/OAuth2SuccessHandler.java` | OAuth2 登录成功处理器 |
| `backend/.../security/oauth2/OAuth2UserInfo.java` | OAuth2 用户信息提取器 |
| `frontend/src/components/OAuth2Buttons.tsx` | OAuth 登录按钮组件 |
| `frontend/src/pages/OAuthCallback.tsx` | OAuth 回调处理页面 |
| `backend/.env.example` | 环境变量模板 |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `backend/pom.xml` | 添加 spring-boot-starter-oauth2-client 依赖 |
| `backend/.../config/SecurityConfig.java` | 添加 OAuth2 登录配置 |
| `backend/.../entity/User.java` | 添加 provider、providerId、avatarUrl 字段 |
| `backend/.../repository/UserRepository.java` | 添加按 provider+providerId 查询方法 |
| `backend/.../security/services/UserDetailsImpl.java` | 支持 OAuth2 用户属性 |
| `backend/src/main/resources/application.properties` | 添加 OAuth2 客户端配置 |
| `frontend/src/pages/Login.tsx` | 添加 OAuth 登录按钮区域 |
| `frontend/src/App.tsx` | 添加 OAuth 回调路由 |

---

## 8. 测试计划

### 8.1 单元测试

- `OAuth2UserServiceImpl`: 测试用户创建和查找逻辑
- `OAuth2SuccessHandler`: 测试 JWT 生成和重定向

### 8.2 集成测试

- GitHub OAuth 登录流程
- Google OAuth 登录流程
- Gitee OAuth 登录流程
- 小米 OAuth 登录流程

### 8.3 边界情况

- 同一邮箱通过不同 provider 登录（应创建不同账户）
- OAuth 用户再次通过用户名/密码登录（应提示使用 OAuth）
- 网络异常时的错误处理

---

## 9. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| OAuth 提供商 API 变更 | 登录失败 | 关注官方文档，及时更新 |
| 小米开发者认证较复杂 | 无法使用小米登录 | 作为可选功能，不影响其他 provider |
| Google 国内访问受限 | Google 登录不可用 | 提供 GitHub/Gitee 作为替代 |
| 用户名冲突 | 创建用户失败 | 添加 provider 前缀或随机后缀 |

---

## 10. 总结

本设计方案通过 Spring Security OAuth2 Client 实现标准化的 OAuth2 登录流程，支持 GitHub、Google、Gitee、小米账号四种登录方式。首次 OAuth 登录自动创建本地账户，与现有 JWT 认证体系无缝集成。

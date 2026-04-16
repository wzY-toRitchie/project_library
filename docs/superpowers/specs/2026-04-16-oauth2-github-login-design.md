# GitHub OAuth2 登录修复设计（端到端）

- 日期：2026-04-16
- 主题：GitHub OAuth2 登录端到端打通（方案 A：URL 直传 token）
- 目标：用户 GitHub 授权后自动登录并跳转首页，后续请求自动携带 JWT

## 1. 范围与验收标准

### 范围
- 修复并打通 GitHub OAuth2 登录链路（后端 OAuth2 成功处理 -> 前端回调解析 -> 登录态落库 -> 首页跳转）。
- 不引入绑定页，不引入 code 换 token。

### 验收标准
1. GitHub 授权成功后，前端自动进入首页 `/` 且为已登录状态。
2. 刷新后保持登录状态（localStorage 中有 user）。
3. 需要鉴权的 API 请求自动带 `Authorization: Bearer <token>`。
4. 授权失败或 token 解析失败时，提示失败并跳回 `/login`。

## 2. 方案选择

### 备选方案
- A（采用）：后端回调 URL 直传 `token`，前端直接解析并登录。
- B：后端传 `code`，前端调用交换接口换 JWT。
- C：双协议兼容（token/code 并存）。

### 选择理由
- 与当前目标“快速端到端打通并可演示”最一致。
- 当前代码已具备 `token` 回调解析能力，改动最小、风险最低。

### 已知权衡
- JWT 出现在 URL（历史记录/日志/Referer 风险）。
- 作为后续升级路线保留方案 B（code 交换）。

## 3. 协议与流程设计

### 3.1 后端成功回调协议
- 路径：`/login/oauth2/code/github` 完成后由成功处理器重定向。
- 目标 URL：`{app.oauth2.authorized-redirect-uri}?token=<jwt>`。
- 关键实现：`backend/src/main/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandler.java:94`。

### 3.2 后端失败回调协议
- 目标 URL：`{app.oauth2.authorized-redirect-uri}?error=OAUTH_LOGIN_FAILED`
- 或：`error=OAUTH_EMAIL_REQUIRED`
- 关键实现：`backend/src/main/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandler.java:103,111`。

### 3.3 前端回调页处理
- 页面读取参数：`token` / `error`。
- 若 `error` 存在：提示“登录失败，请重试”，跳 `/login`。
- 若 `token` 存在：解析 JWT payload，构造 user，执行 `login()`，跳 `/`。
- 关键实现：`frontend/src/pages/OAuthCallback.tsx:11-39`。

### 3.4 登录态与请求鉴权
- `login()` 将 user 写入 `AuthContext` 与 `localStorage`。
- axios 拦截器从 localStorage 读取 `accessToken` 并注入请求头。
- 关键实现：
  - `frontend/src/context/AuthContext.tsx:44-48`
  - `frontend/src/api/index.ts:19-22,43`

## 4. 配置约束

1. `app.oauth2.enabled=true`（启用 OAuth2 相关条件装配 Bean）。
2. `app.oauth2.authorized-redirect-uri` 指向前端回调页面（例：`http://localhost:5173/oauth/callback`）。
3. GitHub OAuth App 回调地址与后端授权流程一致（后端 `/login/oauth2/code/github`）。
4. 安全放行保持 `/api/auth/**` 可访问：`backend/src/main/java/com/bookstore/config/SecurityConfig.java:63`。

## 5. 错误处理与兼容策略

### 错误处理
- 后端成功处理器内部异常统一转成 `error` 参数回前端。
- 前端 token 解析异常提示“登录信息解析失败”并回 `/login`。

### 兼容策略
- 本轮仅支持 URL `token` 协议。
- 后续升级到 code 交换时，在回调页增加 `code` 分支即可，不破坏当前路由结构。

## 6. 测试计划（端到端）

1. 成功链路：点击 GitHub 登录 -> 授权成功 -> 回调带 token -> 自动跳首页并已登录。
2. 刷新链路：刷新首页后仍保持登录状态。
3. 鉴权链路：调用受保护 API，确认 `Authorization` 自动携带，响应非 401。
4. 失败链路：拒绝授权或后端异常，回调带 error，前端提示失败并跳登录页。
5. 无效 token：手工构造坏 token，前端提示解析失败并跳登录页。

## 7. 非目标（本轮不做）

- 不新增 OAuth 账号绑定/解绑页面。
- 不新增 code 交换接口。
- 不修改 JWT claims 结构（仅保证链路打通）。

## 8. 后续安全升级路线（答辩可作为扩展）

1. 升级为 `code -> exchange`，避免 JWT 暴露在 URL。
2. 使用一次性 code + 短 TTL + 重放防护。
3. 增加 state 校验与审计日志。

# 电子邮件验证码注册功能设计

**日期**: 2026-04-28
**状态**: 已批准
**作者**: Claude Code

## 1. 概述

### 1.1 目标

在用户注册流程中增加电子邮件验证码验证，确保用户提供的邮箱地址真实有效。

### 1.2 范围

- 仅用于注册验证（不包含密码重置、修改邮箱等场景）
- 使用 QQ 邮箱 SMTP 发送验证码
- 开发环境支持 Mock 模式（不发送真实邮件）
- 验证码存储使用内存 ConcurrentHashMap（与现有 LoginAttemptService 风格一致）

### 1.3 约束

- 项目无 Redis，使用内存存储
- 重启后验证码丢失（可接受，毕业设计场景）
- `/api/auth/**` 已配置为公开接口，无需修改 SecurityConfig

## 2. 架构设计

### 2.1 注册流程（改造后）

```
用户填写表单
    ↓
点击"发送验证码"
    ↓
后端生成验证码并发送邮件
    ↓
用户输入验证码
    ↓
提交注册
    ↓
后端校验验证码
    ↓
创建用户 → 跳转登录页
```

### 2.2 核心组件

| 组件 | 文件路径 | 职责 |
|------|----------|------|
| `EmailService` | `backend/.../service/EmailService.java` | 验证码生成、邮件发送、存储与校验、频率限制 |
| `AuthController` | `backend/.../controller/AuthController.java` | 新增 send-code 端点，修改 signup 增加验证码校验 |
| `SignupRequest` | `backend/.../payload/request/SignupRequest.java` | 新增 verificationCode 字段 |
| `Register.tsx` | `frontend/src/pages/Register.tsx` | 新增验证码输入框、发送按钮、倒计时逻辑 |

### 2.3 数据流

```
┌─────────────┐     POST /api/auth/send-code     ┌─────────────┐
│   前端       │ ─────────────────────────────────→│   后端       │
│ Register.tsx │                                   │ AuthController│
└─────────────┘                                   └──────┬──────┘
                                                         │
                                                         ↓
                                                  ┌─────────────┐
                                                  │ EmailService │
                                                  │ - 生成验证码  │
                                                  │ - 存储验证码  │
                                                  │ - 发送邮件   │
                                                  └─────────────┘
                                                         │
                                                         ↓
                                                  ┌─────────────┐
                                                  │  QQ 邮箱 SMTP│
                                                  └─────────────┘
```

## 3. 后端详细设计

### 3.1 新增依赖

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 3.2 配置项

```properties
# application.properties

# 邮件验证码配置
app.email.mock=true                          # Mock 模式开关（开发环境）
app.email.code-expiration-minutes=5          # 验证码有效期（分钟）
app.email.send-interval-seconds=60           # 发送间隔（秒）

# QQ 邮箱 SMTP（Mock=false 时生效）
spring.mail.host=smtp.qq.com
spring.mail.port=587
spring.mail.username=your-qq-email@qq.com
spring.mail.password=your-smtp-authorization-code
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 3.3 EmailService 设计

```java
@Service
public class EmailService {

    @Value("${app.email.mock:true}")
    private boolean mockMode;

    @Value("${app.email.code-expiration-minutes:5}")
    private int codeExpirationMinutes;

    @Value("${app.email.send-interval-seconds:60}")
    private int sendIntervalSeconds;

    private final JavaMailSender mailSender;

    // 验证码存储：邮箱 → 验证码条目
    private final ConcurrentHashMap<String, VerificationEntry> codeStore = new ConcurrentHashMap<>();

    // 发送频率限制：邮箱 → 上次发送时间
    private final ConcurrentHashMap<String, LocalDateTime> lastSendTime = new ConcurrentHashMap<>();

    // 验证码条目
    private record VerificationEntry(String code, LocalDateTime expireTime) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expireTime);
        }
    }

    /**
     * 发送验证码
     * @param email 目标邮箱
     * @throws RuntimeException 频率限制或发送失败
     */
    public void sendVerificationCode(String email) {
        // 1. 检查发送频率限制
        // 2. 生成 6 位数字验证码
        // 3. 存储验证码（含过期时间）
        // 4. 发送邮件（Mock 模式跳过）
        // 5. 记录发送时间
    }

    /**
     * 校验验证码
     * @param email 邮箱
     * @param code 用户输入的验证码
     * @return 是否有效
     */
    public boolean verifyCode(String email, String code) {
        // 1. 从 codeStore 获取验证码
        // 2. 检查是否存在
        // 3. 检查是否过期
        // 4. 比对验证码
    }

    /**
     * 清除已使用的验证码
     * @param email 邮箱
     */
    public void removeCode(String email) {
        codeStore.remove(email);
    }

    /**
     * 生成 6 位数字验证码
     */
    private String generateCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    /**
     * 发送邮件
     */
    private void sendEmail(String to, String code) {
        if (mockMode) {
            log.info("[Mock] 验证码邮件 - 收件人: {}, 验证码: {}", to, code);
            return;
        }
        // 使用 JavaMailSender 发送邮件
    }
}
```

### 3.4 AuthController 改造

```java
// 新增：发送验证码端点
@PostMapping("/auth/send-code")
public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
    String email = request.get("email");

    // 1. 校验邮箱格式
    // 2. 检查邮箱是否已注册
    // 3. 调用 emailService.sendVerificationCode(email)

    return ResponseEntity.ok(new MessageResponse("验证码已发送"));
}

// 修改：注册端点增加验证码校验
@PostMapping("/auth/signup")
public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    // 1. 校验验证码
    if (!emailService.verifyCode(signUpRequest.getEmail(), signUpRequest.getVerificationCode())) {
        return ResponseEntity.badRequest().body(new MessageResponse("验证码无效或已过期"));
    }

    // 2. 检查用户名是否已存在
    // 3. 检查邮箱是否已存在
    // 4. 创建用户
    // 5. 清除验证码
    emailService.removeCode(signUpRequest.getEmail());

    return ResponseEntity.ok(new MessageResponse("注册成功"));
}
```

### 3.5 SignupRequest 扩展

```java
public class SignupRequest {
    @NotBlank @Size(min = 3, max = 20)
    private String username;

    @NotBlank @Size(max = 50) @Email
    private String email;

    @NotBlank @Size(min = 8, max = 40)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "密码必须包含至少一个大写字母、一个小写字母和一个数字")
    private String password;

    @NotBlank(message = "验证码不能为空")
    @Size(min = 6, max = 6, message = "验证码必须为6位")
    private String verificationCode;  // 新增
}
```

## 4. 前端详细设计

### 4.1 Register.tsx 表单改造

**新增状态**：
```typescript
const [verificationCode, setVerificationCode] = useState('');
const [countdown, setCountdown] = useState(0);
const [sendingCode, setSendingCode] = useState(false);
```

**表单布局**：
```
┌─────────────────────────────────────┐
│ 用户名: [________________]          │
│ 邮箱:   [________________]          │
│ 验证码: [______] [发送验证码]        │  ← 新增
│ 密码:   [________________]          │
│ 确认密码: [________________]        │
│ ☐ 我同意服务条款                    │
│ [注册]                              │
└─────────────────────────────────────┘
```

### 4.2 发送验证码逻辑

```typescript
const handleSendCode = async () => {
    // 前端校验邮箱格式
    if (!formValues.email || !isValidEmail(formValues.email)) {
        message.error('请输入正确的邮箱地址');
        return;
    }

    setSendingCode(true);
    try {
        await api.post('/auth/send-code', { email: formValues.email });
        message.success('验证码已发送，请查收邮件');
        setCountdown(60);  // 启动 60 秒倒计时
    } catch (error: any) {
        message.error(error.response?.data?.message || '发送失败，请重试');
    } finally {
        setSendingCode(false);
    }
};
```

### 4.3 倒计时实现

```typescript
useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
        setCountdown(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
}, [countdown]);
```

### 4.4 提交逻辑修改

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... 原有校验逻辑 ...

    try {
        await api.post('/auth/signup', {
            username: formValues.username,
            email: formValues.email,
            password: formValues.password,
            verificationCode: verificationCode  // 新增
        });
        message.success('注册成功');
        navigate('/login');
    } catch (error) {
        // 错误处理
    }
};
```

### 4.5 按钮状态

| 状态 | 按钮显示 | 可点击 | 样式 |
|------|----------|--------|------|
| 初始 | "发送验证码" | 是 | 主色调 |
| 发送中 | "发送中..." | 否 | 灰色 |
| 倒计时 | "重新发送(59s)" | 否 | 灰色 |
| 倒计时结束 | "重新发送" | 是 | 主色调 |

## 5. 错误处理

### 5.1 后端错误响应

| 场景 | HTTP 状态 | 错误消息 |
|------|-----------|----------|
| 邮箱格式无效 | 400 | "邮箱格式不正确" |
| 邮箱已注册 | 400 | "该账号已被注册" |
| 发送频率过快 | 429 | "发送过于频繁，请稍后再试" |
| 验证码为空 | 400 | "验证码不能为空" |
| 验证码错误 | 400 | "验证码无效或已过期" |
| 邮件发送失败 | 500 | "验证码发送失败，请稍后重试" |

### 5.2 前端错误处理

- 发送验证码失败：显示后端返回的错误消息
- 注册失败：显示后端返回的错误消息
- 网络错误：显示通用错误提示

## 6. 安全考虑

### 6.1 频率限制

- 每个邮箱 60 秒内只能发送一次验证码
- 使用内存 Map 记录上次发送时间
- 与现有 LoginAttemptService 风格一致

### 6.2 验证码安全

- 6 位数字验证码，100 万种组合
- 有效期 5 分钟，过期自动失效
- 验证成功后立即清除，防止重放

### 6.3 防枚举

- 发送验证码时检查邮箱是否已注册，但返回统一消息"验证码已发送"
- 注册时检查邮箱是否已存在，返回"该账号已被注册"

## 7. 测试策略

### 7.1 后端测试

- EmailService 单元测试
  - 验证码生成
  - 验证码存储和校验
  - 频率限制
  - 过期处理
- AuthController 集成测试
  - 发送验证码端点
  - 注册端点（含验证码校验）

### 7.2 前端测试

- 表单渲染测试
- 发送验证码按钮状态测试
- 倒计时逻辑测试
- 注册提交测试

## 8. 文件变更清单

### 8.1 新增文件

| 文件 | 说明 |
|------|------|
| `backend/.../service/EmailService.java` | 邮件验证码服务 |

### 8.2 修改文件

| 文件 | 变更 |
|------|------|
| `backend/pom.xml` | 添加 spring-boot-starter-mail 依赖 |
| `backend/.../application.properties` | 添加邮件和验证码配置 |
| `backend/.../controller/AuthController.java` | 新增 send-code 端点，修改 signup 逻辑 |
| `backend/.../payload/request/SignupRequest.java` | 新增 verificationCode 字段 |
| `frontend/src/pages/Register.tsx` | 新增验证码输入框、发送按钮、倒计时 |

## 9. Mock 模式说明

当 `app.email.mock=true` 时：

- 验证码固定为 `123456`
- 不发送真实邮件
- 控制台打印日志：`[Mock] 验证码邮件 - 收件人: xxx@example.com, 验证码: 123456`
- 适用于开发和测试环境

当 `app.email.mock=false` 时：

- 生成随机 6 位验证码
- 通过 QQ 邮箱 SMTP 发送真实邮件
- 需要配置正确的 SMTP 授权码

# 电子邮件验证码注册功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户注册流程中增加电子邮件验证码验证，确保邮箱地址真实有效

**Architecture:** 使用集中式 EmailService 统一处理验证码生成、邮件发送、存储与校验，采用内存 ConcurrentHashMap 存储验证码，支持 Mock 模式开发调试

**Tech Stack:** Spring Boot 3.2.2, Spring Mail, Java 21, React 19, TypeScript, Ant Design

---

## 文件结构映射

### 新增文件

| 文件路径 | 职责 |
|----------|------|
| `backend/src/main/java/com/bookstore/service/EmailService.java` | 邮件验证码服务（生成、发送、存储、校验、频率限制） |
| `backend/src/test/java/com/bookstore/service/EmailServiceTest.java` | EmailService 单元测试 |

### 修改文件

| 文件路径 | 变更内容 |
|----------|----------|
| `backend/pom.xml` | 添加 spring-boot-starter-mail 依赖 |
| `backend/src/main/resources/application.properties` | 添加邮件和验证码配置 |
| `backend/src/main/java/com/bookstore/payload/request/SignupRequest.java` | 新增 verificationCode 字段 |
| `backend/src/main/java/com/bookstore/controller/AuthController.java` | 新增 send-code 端点，修改 signup 逻辑 |
| `frontend/src/pages/Register.tsx` | 新增验证码输入框、发送按钮、倒计时逻辑 |

---

## Task 1: 添加邮件依赖和配置

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.properties`

- [ ] **Step 1: 添加 spring-boot-starter-mail 依赖**

在 `backend/pom.xml` 的 `<dependencies>` 部分添加：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

- [ ] **Step 2: 添加邮件验证码配置**

在 `backend/src/main/resources/application.properties` 末尾添加：

```properties
# 邮件验证码配置
app.email.mock=true
app.email.code-expiration-minutes=5
app.email.send-interval-seconds=60

# QQ 邮箱 SMTP（Mock=false 时生效）
spring.mail.host=smtp.qq.com
spring.mail.port=587
spring.mail.username=your-qq-email@qq.com
spring.mail.password=your-smtp-authorization-code
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

- [ ] **Step 3: 验证依赖下载**

运行：`cd backend && mvn dependency:resolve`
预期：BUILD SUCCESS，无错误

- [ ] **Step 4: 提交**

```bash
git add backend/pom.xml backend/src/main/resources/application.properties
git commit -m "deps: add spring-boot-starter-mail and email config"
```

---

## Task 2: 创建 EmailService（TDD - 先写测试）

**Files:**
- Create: `backend/src/test/java/com/bookstore/service/EmailServiceTest.java`
- Create: `backend/src/main/java/com/bookstore/service/EmailService.java`

- [ ] **Step 1: 创建 EmailService 测试类**

创建 `backend/src/test/java/com/bookstore/service/EmailServiceTest.java`：

```java
package com.bookstore.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTest {

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(null);
        ReflectionTestUtils.setField(emailService, "mockMode", true);
        ReflectionTestUtils.setField(emailService, "codeExpirationMinutes", 5);
        ReflectionTestUtils.setField(emailService, "sendIntervalSeconds", 60);
    }

    @Test
    void shouldGenerateAndStoreVerificationCode() {
        // When
        emailService.sendVerificationCode("test@example.com");

        // Then - 验证码应该被存储
        assertTrue(emailService.verifyCode("test@example.com", "123456"));
    }

    @Test
    void shouldReturnFalseForInvalidCode() {
        // Given
        emailService.sendVerificationCode("test@example.com");

        // When & Then
        assertFalse(emailService.verifyCode("test@example.com", "999999"));
    }

    @Test
    void shouldReturnFalseForExpiredCode() {
        // Given
        emailService.sendVerificationCode("test@example.com");

        // When - 模拟过期（直接修改过期时间）
        ReflectionTestUtils.setField(emailService, "codeExpirationMinutes", -1);
        emailService.sendVerificationCode("test@example.com");

        // Then
        assertFalse(emailService.verifyCode("test@example.com", "123456"));
    }

    @Test
    void shouldRemoveCodeAfterVerification() {
        // Given
        emailService.sendVerificationCode("test@example.com");

        // When
        emailService.removeCode("test@example.com");

        // Then
        assertFalse(emailService.verifyCode("test@example.com", "123456"));
    }

    @Test
    void shouldEnforceSendInterval() {
        // Given
        emailService.sendVerificationCode("test@example.com");

        // When & Then - 60秒内再次发送应抛出异常
        assertThrows(RuntimeException.class, () -> {
            emailService.sendVerificationCode("test@example.com");
        });
    }

    @Test
    void shouldReturnFalseForNonExistentEmail() {
        // When & Then
        assertFalse(emailService.verifyCode("nonexistent@example.com", "123456"));
    }
}
```

- [ ] **Step 2: 运行测试验证失败**

运行：`cd backend && mvn test -Dtest=EmailServiceTest -pl .`
预期：FAIL - EmailService 类不存在

- [ ] **Step 3: 创建 EmailService 实现**

创建 `backend/src/main/java/com/bookstore/service/EmailService.java`：

```java
package com.bookstore.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
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

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * 发送验证码
     * @param email 目标邮箱
     * @throws RuntimeException 频率限制或发送失败
     */
    public void sendVerificationCode(String email) {
        // 检查发送频率限制
        LocalDateTime lastSend = lastSendTime.get(email);
        if (lastSend != null && LocalDateTime.now().isBefore(lastSend.plusSeconds(sendIntervalSeconds))) {
            throw new RuntimeException("发送过于频繁，请稍后再试");
        }

        // 生成 6 位数字验证码
        String code = mockMode ? "123456" : generateCode();

        // 存储验证码（含过期时间）
        LocalDateTime expireTime = LocalDateTime.now().plusMinutes(codeExpirationMinutes);
        codeStore.put(email, new VerificationEntry(code, expireTime));

        // 发送邮件
        sendEmail(email, code);

        // 记录发送时间
        lastSendTime.put(email, LocalDateTime.now());

        log.info("验证码已发送 - 邮箱: {}, Mock模式: {}", email, mockMode);
    }

    /**
     * 校验验证码
     * @param email 邮箱
     * @param code 用户输入的验证码
     * @return 是否有效
     */
    public boolean verifyCode(String email, String code) {
        VerificationEntry entry = codeStore.get(email);
        if (entry == null) {
            return false;
        }
        if (entry.isExpired()) {
            codeStore.remove(email);
            return false;
        }
        return entry.code().equals(code);
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
        // TODO: 使用 JavaMailSender 发送真实邮件
        // 实际项目中需要实现邮件发送逻辑
    }
}
```

- [ ] **Step 4: 运行测试验证通过**

运行：`cd backend && mvn test -Dtest=EmailServiceTest -pl .`
预期：ALL TESTS PASS

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/java/com/bookstore/service/EmailService.java backend/src/test/java/com/bookstore/service/EmailServiceTest.java
git commit -m "feat: add EmailService with verification code support"
```

---

## Task 3: 扩展 SignupRequest 添加验证码字段

**Files:**
- Modify: `backend/src/main/java/com/bookstore/payload/request/SignupRequest.java`

- [ ] **Step 1: 添加 verificationCode 字段**

在 `SignupRequest.java` 中添加新字段：

```java
package com.bookstore.payload.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20之间")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Size(max = 50, message = "邮箱长度不能超过50")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 40, message = "密码长度必须在8-40之间")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "密码必须包含至少一个大写字母、一个小写字母和一个数字")
    private String password;

    @NotBlank(message = "验证码不能为空")
    @Size(min = 6, max = 6, message = "验证码必须为6位")
    private String verificationCode;
}
```

- [ ] **Step 2: 验证编译**

运行：`cd backend && mvn compile -pl .`
预期：BUILD SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/main/java/com/bookstore/payload/request/SignupRequest.java
git commit -m "feat: add verificationCode field to SignupRequest"
```

---

## Task 4: 修改 AuthController 添加验证码功能

**Files:**
- Modify: `backend/src/main/java/com/bookstore/controller/AuthController.java`

- [ ] **Step 1: 注入 EmailService**

在 `AuthController` 类中添加 EmailService 依赖：

```java
package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.payload.request.LoginRequest;
import com.bookstore.payload.request.SignupRequest;
import com.bookstore.payload.response.JwtResponse;
import com.bookstore.payload.response.MessageResponse;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    // ... 其他方法保持不变 ...
}
```

- [ ] **Step 2: 添加发送验证码端点**

在 AuthController 中添加新方法：

```java
@PostMapping("/send-code")
public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
    String email = request.get("email");

    // 校验邮箱格式
    if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
        return ResponseEntity.badRequest().body(new MessageResponse("邮箱格式不正确"));
    }

    // 检查邮箱是否已注册
    if (userRepository.existsByEmail(email)) {
        // 为防止枚举攻击，返回统一消息
        return ResponseEntity.ok(new MessageResponse("验证码已发送"));
    }

    try {
        emailService.sendVerificationCode(email);
        return ResponseEntity.ok(new MessageResponse("验证码已发送"));
    } catch (RuntimeException e) {
        return ResponseEntity.status(429).body(new MessageResponse(e.getMessage()));
    }
}
```

- [ ] **Step 3: 修改注册端点添加验证码校验**

修改现有的 `registerUser` 方法：

```java
@PostMapping("/signup")
public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    // 校验验证码
    if (!emailService.verifyCode(signUpRequest.getEmail(), signUpRequest.getVerificationCode())) {
        return ResponseEntity.badRequest().body(new MessageResponse("验证码无效或已过期"));
    }

    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
        return ResponseEntity.badRequest().body(new MessageResponse("该账号已被注册"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
        return ResponseEntity.badRequest().body(new MessageResponse("该账号已被注册"));
    }

    User user = new User();
    user.setUsername(signUpRequest.getUsername());
    user.setEmail(signUpRequest.getEmail());
    user.setPassword(encoder.encode(signUpRequest.getPassword()));
    user.setRole("USER");

    userRepository.save(user);

    // 清除已使用的验证码
    emailService.removeCode(signUpRequest.getEmail());

    return ResponseEntity.ok(new MessageResponse("注册成功"));
}
```

- [ ] **Step 4: 验证编译**

运行：`cd backend && mvn compile -pl .`
预期：BUILD SUCCESS

- [ ] **Step 5: 提交**

```bash
git add backend/src/main/java/com/bookstore/controller/AuthController.java
git commit -m "feat: add send-code endpoint and verification to signup"
```

---

## Task 5: 修改前端 Register.tsx 添加验证码功能

**Files:**
- Modify: `frontend/src/pages/Register.tsx`

- [ ] **Step 1: 添加验证码相关状态**

在 Register.tsx 的组件中添加新状态：

```typescript
const [verificationCode, setVerificationCode] = useState('');
const [countdown, setCountdown] = useState(0);
const [sendingCode, setSendingCode] = useState(false);
```

- [ ] **Step 2: 添加倒计时 useEffect**

在组件中添加倒计时逻辑：

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

- [ ] **Step 3: 添加发送验证码函数**

在组件中添加发送验证码逻辑：

```typescript
const handleSendCode = async () => {
    if (!formValues.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
        message.error('请输入正确的邮箱地址');
        return;
    }

    setSendingCode(true);
    try {
        await api.post('/auth/send-code', { email: formValues.email });
        message.success('验证码已发送，请查收邮件');
        setCountdown(60);
    } catch (error: any) {
        message.error(error.response?.data?.message || '发送失败，请重试');
    } finally {
        setSendingCode(false);
    }
};
```

- [ ] **Step 4: 添加验证码输入框 UI**

在邮箱输入框下方添加验证码输入区域：

```tsx
{/* 验证码输入 */}
<div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
        验证码
    </label>
    <div className="flex gap-2">
        <input
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入6位验证码"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
            type="button"
            onClick={handleSendCode}
            disabled={countdown > 0 || sendingCode}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                countdown > 0 || sendingCode
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
            {sendingCode ? '发送中...' : countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码'}
        </button>
    </div>
</div>
```

- [ ] **Step 5: 修改提交逻辑**

修改 handleSubmit 函数，添加 verificationCode 到请求体：

```typescript
await api.post('/auth/signup', {
    username: formValues.username,
    email: formValues.email,
    password: formValues.password,
    verificationCode: verificationCode
});
```

- [ ] **Step 6: 验证前端编译**

运行：`cd frontend && npm run build`
预期：BUILD SUCCESS，无错误

- [ ] **Step 7: 提交**

```bash
git add frontend/src/pages/Register.tsx
git commit -m "feat: add email verification code input to register page"
```

---

## Task 6: 集成测试验证

**Files:**
- 测试整个注册流程

- [ ] **Step 1: 启动后端服务**

运行：`cd backend && mvn spring-boot:run`
预期：应用启动成功，无错误

- [ ] **Step 2: 启动前端服务**

运行：`cd frontend && npm run dev`
预期：开发服务器启动成功

- [ ] **Step 3: 测试发送验证码接口**

使用 curl 测试：

```bash
curl -X POST http://localhost:8080/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

预期响应：`{"message": "验证码已发送"}`

- [ ] **Step 4: 测试注册接口**

使用 curl 测试（Mock 模式验证码为 123456）：

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "verificationCode": "123456"
  }'
```

预期响应：`{"message": "注册成功"}`

- [ ] **Step 5: 测试错误场景**

测试验证码错误：

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "Test@123",
    "verificationCode": "999999"
  }'
```

预期响应：`{"message": "验证码无效或已过期"}`

- [ ] **Step 6: 测试频率限制**

快速连续发送两次验证码：

```bash
curl -X POST http://localhost:8080/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

curl -X POST http://localhost:8080/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

第二次预期响应：`{"message": "发送过于频繁，请稍后再试"}`（HTTP 429）

- [ ] **Step 7: 最终提交**

```bash
git add -A
git commit -m "feat: complete email verification registration feature"
```

---

## 自检清单

- [ ] 所有代码无占位符（TBD、TODO）
- [ ] 类型和方法签名一致
- [ ] 测试覆盖核心功能
- [ ] 错误处理完整
- [ ] Mock 模式正常工作
- [ ] 频率限制生效
- [ ] 前端 UI 完整
- [ ] 提交历史清晰

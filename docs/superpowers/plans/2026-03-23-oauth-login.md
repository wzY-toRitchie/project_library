# OAuth 第三方登录功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [`) syntax for tracking.

**Goal:** 为在线书店项目添加 GitHub、Google、Gitee、小米账号四种 OAuth 第三方登录功能

**Architecture:** 使用 Spring Security OAuth2 Client 处理授权流程，首次登录自动创建本地账户，登录成功后生成 JWT 并重定向到前端

**Tech Stack:** Spring Boot 3.2.2, Spring Security OAuth2 Client, React 18, TypeScript

**Design Document:** `docs/superpowers/specs/2026-03-23-oauth-login-design.md`

---

## 文件变更总览

### 新增文件

| 文件路径 | 职责 |
|----------|------|
| `backend/src/main/java/com/bookstore/security/oauth2/OAuth2UserInfo.java` | OAuth2 用户信息提取接口和实现 |
| `backend/src/main/java/com/bookstore/security/oauth2/OAuth2UserServiceImpl.java` | OAuth2 用户加载服务，查找或创建本地用户 |
| `backend/src/main/java/com/bookstore/security/oauth2/OAuth2SuccessHandler.java` | OAuth2 登录成功处理器，生成 JWT 并重定向 |
| `frontend/src/components/OAuth2Buttons.tsx` | OAuth 登录按钮组件 |
| `frontend/src/pages/OAuthCallback.tsx` | OAuth 回调处理页面 |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `backend/pom.xml` | 添加 spring-boot-starter-oauth2-client 依赖 |
| `backend/src/main/java/com/bookstore/entity/User.java` | 添加 provider、providerId、avatarUrl 字段 |
| `backend/src/main/java/com/bookstore/repository/UserRepository.java` | 添加按 provider+providerId 查询方法 |
| `backend/src/main/java/com/bookstore/security/services/UserDetailsImpl.java` | 添加 OAuth2 属性支持 |
| `backend/src/main/java/com/bookstore/config/SecurityConfig.java` | 添加 OAuth2 登录配置 |
| `backend/src/main/resources/application.properties` | 添加 OAuth2 客户端配置 |
| `frontend/src/pages/Login.tsx` | 添加 OAuth 登录按钮区域 |
| `frontend/src/App.tsx` | 添加 OAuth 回调路由 |

---

## Task 1: 数据库实体和 Repository 修改

**Files:**
- Modify: `backend/src/main/java/com/bookstore/entity/User.java`
- Modify: `backend/src/main/java/com/bookstore/repository/UserRepository.java`

- [ ] **Step 1: 修改 User 实体，添加 OAuth 字段**

```java
// User.java 添加以下字段

@Column(name = "provider")
private String provider = "local"; // github, google, gitee, xiaomi, local

@Column(name = "provider_id")
private String providerId;

@Column(name = "avatar_url")
private String avatarUrl;

// 修改 password 字段为可空
@Column(nullable = true)
@JsonIgnore
private String password;
```

- [ ] **Step 2: 修改 UserRepository，添加查询方法**

```java
// UserRepository.java 添加以下方法

Optional<User> findByProviderAndProviderId(String provider, String providerId);

Optional<User> findByEmail(String email);

boolean existsByProviderAndProviderId(String provider, String providerId);
```

- [ ] **Step 3: 编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 4: 提交**

```bash
git add backend/src/main/java/com/bookstore/entity/User.java
git add backend/src/main/java/com/bookstore/repository/UserRepository.java
git commit -m "feat(oauth): add OAuth fields to User entity and repository methods"
```

---

## Task 2: 添加 Maven 依赖和配置

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.properties`

- [ ] **Step 1: 添加 OAuth2 Client 依赖**

```xml
<!-- pom.xml 在 spring-boot-starter-security 依赖后添加 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

- [ ] **Step 2: 添加 OAuth2 配置**

```properties
# application.properties 在文件末尾添加

# OAuth2 - GitHub
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID:demo-github-client-id}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET:demo-github-secret}
spring.security.oauth2.client.registration.github.scope=read:user,user:email

# OAuth2 - Google
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:demo-google-client-id}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:demo-google-secret}
spring.security.oauth2.client.registration.google.scope=openid,profile,email

# OAuth2 - Gitee
spring.security.oauth2.client.registration.gitee.client-id=${GITEE_CLIENT_ID:demo-gitee-client-id}
spring.security.oauth2.client.registration.gitee.client-secret=${GITEE_CLIENT_SECRET:demo-gitee-secret}
spring.security.oauth2.client.registration.gitee.scope=user_info
spring.security.oauth2.client.registration.gitee.client-name=Gitee
spring.security.oauth2.client.registration.gitee.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.gitee.redirect-uri={baseUrl}/api/oauth2/callback/{registrationId}
spring.security.oauth2.client.provider.gitee.authorization-uri=https://gitee.com/oauth/authorize
spring.security.oauth2.client.provider.gitee.token-uri=https://gitee.com/oauth/token
spring.security.oauth2.client.provider.gitee.user-info-uri=https://gitee.com/api/v5/user
spring.security.oauth2.client.provider.gitee.user-name-property=id

# OAuth2 - 小米
spring.security.oauth2.client.registration.xiaomi.client-id=${XIAOMI_CLIENT_ID:demo-xiaomi-client-id}
spring.security.oauth2.client.registration.xiaomi.client-secret=${XIAOMI_CLIENT_SECRET:demo-xiaomi-secret}
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

- [ ] **Step 3: 验证依赖下载**

Run: `cd backend && mvn dependency:resolve`
Expected: 成功下载 spring-boot-starter-oauth2-client

- [ ] **Step 4: 提交**

```bash
git add backend/pom.xml backend/src/main/resources/application.properties
git commit -m "feat(oauth): add OAuth2 client dependency and configuration"
```

---

## Task 3: 创建 OAuth2 用户信息提取器

**Files:**
- Create: `backend/src/main/java/com/bookstore/security/oauth2/OAuth2UserInfo.java`

- [ ] **Step 1: 创建 OAuth2UserInfo 接口和实现类**

```java
package com.bookstore.security.oauth2;

import java.util.Map;

public interface OAuth2UserInfo {
    String getProviderId();
    String getEmail();
    String getName();
    String getAvatarUrl();
}

// GitHub 用户信息
class GithubOAuth2UserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;
    
    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    @Override
    public String getProviderId() {
        return attributes.get("id").toString();
    }
    
    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
    
    @Override
    public String getName() {
        return (String) attributes.get("name");
    }
    
    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("avatar_url");
    }
}

// Google 用户信息
class GoogleOAuth2UserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;
    
    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    @Override
    public String getProviderId() {
        return (String) attributes.get("sub");
    }
    
    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
    
    @Override
    public String getName() {
        return (String) attributes.get("name");
    }
    
    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("picture");
    }
}

// Gitee 用户信息
class GiteeOAuth2UserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;
    
    public GiteeOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    @Override
    public String getProviderId() {
        return attributes.get("id").toString();
    }
    
    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
    
    @Override
    public String getName() {
        return (String) attributes.get("name");
    }
    
    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("avatar_url");
    }
}

// 小米用户信息
class XiaomiOAuth2UserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;
    
    public XiaomiOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    @Override
    public String getProviderId() {
        return (String) attributes.get("union_id");
    }
    
    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }
    
    @Override
    public String getName() {
        return (String) attributes.get("miliaoNick");
    }
    
    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("miliaoIconOrig");
    }
}

// 工厂类
class OAuth2UserInfoFactory {
    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId) {
            case "github" -> new GithubOAuth2UserInfo(attributes);
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "gitee" -> new GiteeOAuth2UserInfo(attributes);
            case "xiaomi" -> new XiaomiOAuth2UserInfo(attributes);
            default -> throw new IllegalArgumentException("不支持的 OAuth 提供商: " + registrationId);
        };
    }
}
```

- [ ] **Step 2: 编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/main/java/com/bookstore/security/oauth2/OAuth2UserInfo.java
git commit -m "feat(oauth): add OAuth2 user info extractors for all providers"
```

---

## Task 4: 创建 OAuth2 用户加载服务

**Files:**
- Create: `backend/src/main/java/com/bookstore/security/oauth2/OAuth2UserServiceImpl.java`

- [ ] **Step 1: 创建 OAuth2UserServiceImpl**

```java
package com.bookstore.security.oauth2;

import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

@Service
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserServiceImpl.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        logger.info("OAuth2 登录: provider={}, attributes={}", registrationId, attributes);
        
        // 提取用户信息
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, attributes);
        
        // 查找或创建本地用户
        User user = userRepository.findByProviderAndProviderId(registrationId, userInfo.getProviderId())
                .orElseGet(() -> createNewUser(registrationId, userInfo));
        
        return UserDetailsImpl.build(user, attributes);
    }
    
    private User createNewUser(String provider, OAuth2UserInfo userInfo) {
        User user = new User();
        user.setProvider(provider);
        user.setProviderId(userInfo.getProviderId());
        user.setUsername(generateUniqueUsername(userInfo.getName()));
        user.setEmail(userInfo.getEmail() != null ? userInfo.getEmail() : generateTempEmail(provider, userInfo.getProviderId()));
        user.setFullName(userInfo.getName());
        user.setAvatarUrl(userInfo.getAvatarUrl());
        user.setPassword(null); // OAuth 用户无密码
        user.setRole("USER");
        
        logger.info("创建新 OAuth 用户: provider={}, username={}", provider, user.getUsername());
        return userRepository.save(user);
    }
    
    private String generateUniqueUsername(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "user_" + UUID.randomUUID().toString().substring(0, 8);
        }
        
        // 清理用户名
        String baseName = name.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5]", "_").toLowerCase();
        if (baseName.length() > 20) {
            baseName = baseName.substring(0, 20);
        }
        
        // 检查是否已存在
        if (!userRepository.existsByUsername(baseName)) {
            return baseName;
        }
        
        // 添加随机后缀
        return baseName + "_" + UUID.randomUUID().toString().substring(0, 6);
    }
    
    private String generateTempEmail(String provider, String providerId) {
        return provider + "_" + providerId + "@oauth.temp";
    }
}
```

- [ ] **Step 2: 编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/main/java/com/bookstore/security/oauth2/OAuth2UserServiceImpl.java
git commit -m "feat(oauth): add OAuth2 user service for auto user creation"
```

---

## Task 5: 创建 OAuth2 登录成功处理器

**Files:**
- Create: `backend/src/main/java/com/bookstore/security/oauth2/OAuth2SuccessHandler.java`

- [ ] **Step 1: 创建 OAuth2SuccessHandler**

```java
package com.bookstore.security.oauth2;

import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);
    
    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth/callback}")
    private String redirectUri;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 生成 JWT
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        logger.info("OAuth2 登录成功: userId={}, username={}", userDetails.getId(), userDetails.getUsername());
        
        // 构建重定向 URL
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", jwt)
                .queryParam("userId", userDetails.getId())
                .queryParam("username", URLEncoder.encode(userDetails.getUsername(), StandardCharsets.UTF_8))
                .queryParam("email", userDetails.getEmail() != null ? 
                    URLEncoder.encode(userDetails.getEmail(), StandardCharsets.UTF_8) : "")
                .build().toUriString();
        
        response.sendRedirect(targetUrl);
    }
}
```

- [ ] **Step 2: 编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/main/java/com/bookstore/security/oauth2/OAuth2SuccessHandler.java
git commit -m "feat(oauth): add OAuth2 success handler with JWT generation"
```

---

## Task 6: 修改 SecurityConfig 集成 OAuth2

**Files:**
- Modify: `backend/src/main/java/com/bookstore/config/SecurityConfig.java`

- [ ] **Step 1: 修改 SecurityConfig**

```java
// SecurityConfig.java

// 1. 添加导入
import com.bookstore.security.oauth2.OAuth2UserServiceImpl;
import com.bookstore.security.oauth2.OAuth2SuccessHandler;

// 2. 添加依赖注入
@Autowired
private OAuth2UserServiceImpl oAuth2UserService;

@Autowired
private OAuth2SuccessHandler oAuth2SuccessHandler;

// 3. 修改 filterChain 方法，在 authorizeHttpRequests 之前添加
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/oauth2/**").permitAll()  // 新增：允许 OAuth2 端点
    .requestMatchers("/error").permitAll()
    // ... 其他配置不变
)

// 4. 在 http.build() 之前添加 OAuth2 登录配置
.http.oauth2Login(oauth2 -> oauth2
    .authorizationEndpoint(authorization -> authorization
        .baseUri("/api/oauth2/authorization"))
    .redirectionEndpoint(redirection -> redirection
        .baseUri("/api/oauth2/callback/*"))
    .userInfoEndpoint(userInfo -> userInfo
        .userService(oAuth2UserService))
    .successHandler(oAuth2SuccessHandler))
```

完整的 filterChain 方法：

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/oauth2/**").permitAll()
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books/**").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/settings").permitAll()
                    .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/**").permitAll()
                    .requestMatchers("/api/uploads/**").hasRole("ADMIN")
                    .requestMatchers("/api/books/**").hasRole("ADMIN")
                    .requestMatchers("/api/categories/**").hasRole("ADMIN")
                    .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/settings").hasRole("ADMIN")
                    .anyRequest().authenticated())
            .oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(authorization -> authorization
                            .baseUri("/api/oauth2/authorization"))
                    .redirectionEndpoint(redirection -> redirection
                            .baseUri("/api/oauth2/callback/*"))
                    .userInfoEndpoint(userInfo -> userInfo
                            .userService(oAuth2UserService))
                    .successHandler(oAuth2SuccessHandler));

    http.authenticationProvider(authenticationProvider());
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

- [ ] **Step 2: 编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: 提交**

```bash
git add backend/src/main/java/com/bookstore/config/SecurityConfig.java
git commit -m "feat(oauth): integrate OAuth2 login into SecurityConfig"
```

---

## Task 7: 修改 UserDetailsImpl 支持 OAuth2 属性

**Files:**
- Modify: `backend/src/main/java/com/bookstore/security/services/UserDetailsImpl.java`

- [ ] **Step 1: 修改 UserDetailsImpl**

```java
// UserDetailsImpl.java

// 1. 实现 OAuth2User 接口
public class UserDetailsImpl implements UserDetails, OAuth2User {
    
    // 添加 OAuth2 属性字段
    private Map<String, Object> attributes;
    
    // 2. 添加 OAuth2 构造函数
    public UserDetailsImpl(Long id, String username, String email, String password,
                           String fullName, String phoneNumber, String address,
                           Collection<? extends GrantedAuthority> authorities,
                           Map<String, Object> attributes) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.authorities = authorities;
        this.attributes = attributes;
    }
    
    // 3. 添加 build 方法用于 OAuth2
    public static UserDetailsImpl build(User user, Map<String, Object> attributes) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        
        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getAddress(),
                authorities,
                attributes
        );
    }
    
    // 4. 实现 OAuth2User 接口方法
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
    @Override
    public String getName() {
        return username;
    }
}
```

- [ ] **Step 2: 添加导入**

```java
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Map;
```

- [ ] **Step 3: 编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 4: 提交**

```bash
git add backend/src/main/java/com/bookstore/security/services/UserDetailsImpl.java
git commit -m "feat(oauth): implement OAuth2User interface in UserDetailsImpl"
```

---

## Task 8: 创建前端 OAuth 登录按钮组件

**Files:**
- Create: `frontend/src/components/OAuth2Buttons.tsx`

- [ ] **Step 1: 创建 OAuth2Buttons 组件**

```tsx
import React from 'react';

interface OAuthProvider {
    id: string;
    name: string;
    icon: string;
    bgColor: string;
    hoverColor: string;
}

const providers: OAuthProvider[] = [
    { id: 'github', name: 'GitHub', icon: 'code', bgColor: 'bg-gray-800', hoverColor: 'hover:bg-gray-900' },
    { id: 'google', name: 'Google', icon: 'globe', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { id: 'gitee', name: 'Gitee', icon: 'git_branch', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700' },
    { id: 'xiaomi', name: '小米', icon: 'smartphone', bgColor: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const OAuth2Buttons: React.FC = () => {
    const handleOAuthLogin = (providerId: string) => {
        window.location.href = `${API_BASE_URL}/api/oauth2/authorization/${providerId}`;
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">其他登录方式</span>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
                {providers.map((provider) => (
                    <button
                        key={provider.id}
                        onClick={() => handleOAuthLogin(provider.id)}
                        className={`w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm ${provider.bgColor} text-white text-sm font-medium ${provider.hoverColor} transition-colors`}
                        title={`使用 ${provider.name} 登录`}
                    >
                        <span className="material-symbols-outlined text-lg">{provider.icon}</span>
                    </button>
                ))}
            </div>
            <div className="mt-3 text-center text-xs text-gray-500">
                点击按钮将跳转到第三方平台进行授权
            </div>
        </div>
    );
};

export default OAuth2Buttons;
```

- [ ] **Step 2: TypeScript 类型检查**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: 提交**

```bash
git add frontend/src/components/OAuth2Buttons.tsx
git commit -m "feat(oauth): add OAuth2 login buttons component"
```

---

## Task 9: 创建前端 OAuth 回调页面

**Files:**
- Create: `frontend/src/pages/OAuthCallback.tsx`

- [ ] **Step 1: 创建 OAuthCallback 页面**

```tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message, Spin } from 'antd';

const OAuthCallback: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        const email = searchParams.get('email');

        if (token && userId) {
            // 构建用户对象
            const userData = {
                id: Number(userId),
                username: username || '',
                email: email || '',
                accessToken: token,
                tokenType: 'Bearer',
                roles: ['ROLE_USER'],
            };

            // 保存用户信息
            login(userData);
            
            message.success('登录成功');
            navigate('/');
        } else {
            message.error('OAuth 登录失败，请重试');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">正在完成登录...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
```

- [ ] **Step 2: TypeScript 类型检查**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: 提交**

```bash
git add frontend/src/pages/OAuthCallback.tsx
git commit -m "feat(oauth): add OAuth callback handler page"
```

---

## Task 10: 修改 Login 页面和 App 路由

**Files:**
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 修改 Login 页面，添加 OAuth 按钮**

```tsx
// Login.tsx 在 imports 中添加
import OAuth2Buttons from '../components/OAuth2Buttons';

// 在登录表单的最后（关闭 </form> 标签后）添加
<OAuth2Buttons />
```

- [ ] **Step 2: 修改 App.tsx，添加 OAuth 回调路由**

```tsx
// App.tsx

// 1. 添加导入
import OAuthCallback from './pages/OAuthCallback';

// 2. 在 UserLayout 路由中添加
<Route path="/oauth/callback" element={<OAuthCallback />} />
```

- [ ] **Step 3: TypeScript 类型检查**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: 提交**

```bash
git add frontend/src/pages/Login.tsx frontend/src/App.tsx
git commit -m "feat(oauth): integrate OAuth buttons into Login page and add callback route"
```

---

## Task 11: 创建环境变量模板

**Files:**
- Create: `backend/.env.example`

- [ ] **Step 1: 创建 .env.example 文件**

```env
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/online_bookstore?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_at_least_32_bytes
JWT_EXPIRATION_MS=86400000

# OAuth2 - GitHub (获取地址: https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OAuth2 - Google (获取地址: https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth2 - Gitee (获取地址: https://gitee.com/oauth/applications)
GITEE_CLIENT_ID=your_gitee_client_id
GITEE_CLIENT_SECRET=your_gitee_client_secret

# OAuth2 - 小米 (获取地址: https://dev.mi.com)
XIAOMI_CLIENT_ID=your_xiaomi_client_id
XIAOMI_CLIENT_SECRET=your_xiaomi_client_secret

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173

# OAuth2 Frontend Redirect
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth/callback
```

- [ ] **Step 2: 提交**

```bash
git add backend/.env.example
git commit -m "docs(oauth): add environment variables template"
```

---

## Task 12: 端到端测试验证

- [ ] **Step 1: 启动后端服务**

Run: `cd backend && mvn spring-boot:run`
Expected: 应用启动成功，无报错

- [ ] **Step 2: 验证 OAuth2 端点可访问**

Run: `curl http://localhost:8080/api/oauth2/authorization/github -I`
Expected: 302 重定向到 GitHub 授权页面

- [ ] **Step 3: 启动前端服务**

Run: `cd frontend && npm run dev`
Expected: 前端启动在 http://localhost:5173

- [ ] **Step 4: 验证登录页面显示 OAuth 按钮**

访问 http://localhost:5173/login，确认显示 GitHub、Google、Gitee、小米四个 OAuth 登录按钮

- [ ] **Step 5: 测试 GitHub OAuth 登录（需要真实 Client ID）**

点击 GitHub 按钮，确认跳转到 GitHub 授权页面

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "feat(oauth): complete OAuth2 login implementation"
```

---

## 验收清单

- [ ] User 实体包含 provider、providerId、avatarUrl 字段
- [ ] UserRepository 支持按 provider+providerId 查询
- [ ] SecurityConfig 正确配置 OAuth2 登录
- [ ] OAuth2UserServiceImpl 正确处理用户创建
- [ ] OAuth2SuccessHandler 正确生成 JWT 并重定向
- [ ] 前端 Login 页面显示 OAuth 登录按钮
- [ ] 前端 OAuthCallback 页面正确处理回调
- [ ] GitHub OAuth 登录流程正常
- [ ] Google OAuth 登录流程正常
- [ ] Gitee OAuth 登录流程正常
- [ ] 小米 OAuth 登录流程正常（需配置真实凭证）

---

## 后续步骤

完成以上实现后，需要：

1. **配置真实的 OAuth 提供商凭证**：按照设计文档第 6 节的指南获取各平台的 Client ID 和 Secret
2. **更新数据库**：运行 SQL 迁移脚本添加新字段
3. **测试各平台登录**：使用真实凭证测试完整的 OAuth 登录流程

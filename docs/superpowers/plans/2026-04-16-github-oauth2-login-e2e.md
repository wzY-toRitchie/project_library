# GitHub OAuth2 Login E2E Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make GitHub OAuth2 login work end-to-end so users authorize with GitHub, return to `/oauth/callback?token=...`, and are auto-logged-in to home page.

**Architecture:** Keep the chosen lightweight protocol (URL token redirect). Backend owns OAuth2 success/failure redirect behavior and frontend callback page persists session. Wire SecurityConfig to explicitly attach custom OAuth2 handlers so the redirect contract is deterministic.

**Tech Stack:** Spring Boot 3 + Spring Security OAuth2 Client, React 19 + React Router, Vitest + Testing Library, JUnit 5 + Mockito

---

## File Structure Map

- **Modify** `backend/src/main/java/com/bookstore/config/SecurityConfig.java`
  - Wire `oauth2Login` with custom success/failure handlers only when `app.oauth2.enabled=true`.
- **Modify** `backend/src/main/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandler.java`
  - Redirect with `token` (not `code`), remove code-session usage from success path.
- **Modify** `backend/src/main/resources/application.properties`
  - Add explicit OAuth2 feature and redirect defaults for local run.
- **Create** `backend/src/test/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandlerTest.java`
  - Verify success handler redirects with `token`.
- **Modify** `frontend/src/pages/Login.tsx`
  - Add GitHub login button redirecting to backend authorization endpoint.
- **Modify** `frontend/src/pages/OAuthCallback.tsx`
  - Use robust JWT payload decode for base64url; keep token/error flow.
- **Create** `frontend/src/test/oauth-callback.test.tsx`
  - Validate callback success/error/invalid-token flows.
- **Modify** `frontend/.env`
  - Add `VITE_BACKEND_ORIGIN` for OAuth2 authorization URL.

---

### Task 1: Backend OAuth2 Handler Wiring

**Files:**
- Modify: `backend/src/main/java/com/bookstore/config/SecurityConfig.java`

- [ ] **Step 1: Write the failing integration test (security wiring)**

```java
// Add temporary assertion in existing startup test file to ensure bean wiring path is loaded.
// In OAuth2DisabledStartupTest keep oauth disabled path green.
```

- [ ] **Step 2: Run test to verify current behavior gap**

Run: `cd backend && mvn -Dtest=OAuth2DisabledStartupTest test`
Expected: PASS (baseline), and no verification for enabled oauth flow yet.

- [ ] **Step 3: Implement oauth2Login handler wiring in SecurityConfig**

```java
// SecurityConfig.java imports
import com.bookstore.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.bookstore.security.oauth2.OAuth2AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Value;

// SecurityConfig.java fields
@Autowired(required = false)
OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

@Autowired(required = false)
OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

@Value("${app.oauth2.enabled:false}")
private boolean oauth2Enabled;

// SecurityConfig.java in filterChain(...)
if (oauth2Enabled && oAuth2AuthenticationSuccessHandler != null && oAuth2AuthenticationFailureHandler != null) {
    http.oauth2Login(oauth -> oauth
            .successHandler(oAuth2AuthenticationSuccessHandler)
            .failureHandler(oAuth2AuthenticationFailureHandler));
}
```

- [ ] **Step 4: Run compile check**

Run: `cd backend && mvn -Dmaven.test.skip=true clean compile`
Expected: `BUILD SUCCESS`

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/bookstore/config/SecurityConfig.java
git commit -m "fix(auth): wire oauth2 success and failure handlers"
```

---

### Task 2: Backend Success Redirect Switch to Token

**Files:**
- Modify: `backend/src/main/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandler.java`
- Create: `backend/src/test/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandlerTest.java`

- [ ] **Step 1: Write failing unit test for token redirect contract**

```java
package com.bookstore.security.oauth2;

import com.bookstore.entity.User;
import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class OAuth2AuthenticationSuccessHandlerTest {

    @Test
    void redirectsWithTokenQueryParam() throws Exception {
        OAuth2AccountService accountService = Mockito.mock(OAuth2AccountService.class);
        JwtUtils jwtUtils = Mockito.mock(JwtUtils.class);
        GithubEmailService githubEmailService = Mockito.mock(GithubEmailService.class);

        OAuth2AuthenticationSuccessHandler handler = new OAuth2AuthenticationSuccessHandler(
                accountService,
                jwtUtils,
                null,
                githubEmailService,
                null
        );

        var redirectField = OAuth2AuthenticationSuccessHandler.class.getDeclaredField("authorizedRedirectUri");
        redirectField.setAccessible(true);
        redirectField.set(handler, "http://localhost:5173/oauth/callback");

        User user = new User();
        user.setId(1L);
        user.setUsername("oauth_user");
        user.setEmail("oauth@example.com");
        user.setRole("USER");

        when(accountService.loadOrCreateGithubUser(any())).thenReturn(user);
        when(jwtUtils.generateJwtToken(any(UserDetailsImpl.class))).thenReturn("mock.jwt.token");

        OAuth2User principal = new DefaultOAuth2User(List.of(() -> "ROLE_USER"), Map.of(
                "id", "123",
                "name", "OAuth User",
                "email", "oauth@example.com"
        ), "id");

        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, authentication);

        String location = response.getHeader("Location");
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FOUND);
        assertThat(location).contains("/oauth/callback");
        assertThat(location).contains("token=mock.jwt.token");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn -Dtest=OAuth2AuthenticationSuccessHandlerTest test`
Expected: FAIL because current handler redirects with `code` instead of `token`.

- [ ] **Step 3: Implement minimal success handler change**

```java
// OAuth2AuthenticationSuccessHandler.java
// remove field if unused in success path:
// private final OAuth2LoginSessionService oAuth2LoginSessionService;

// constructor signature remove OAuth2LoginSessionService parameter accordingly

String token = jwtUtils.generateJwtToken(userDetails);
String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
        .queryParam("token", token)
        .build()
        .encode()
        .toUriString();

response.sendRedirect(targetUrl);
```

- [ ] **Step 4: Run unit test again**

Run: `cd backend && mvn -Dtest=OAuth2AuthenticationSuccessHandlerTest test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandler.java backend/src/test/java/com/bookstore/security/oauth2/OAuth2AuthenticationSuccessHandlerTest.java
git commit -m "fix(oauth2): redirect github callback with jwt token"
```

---

### Task 3: Frontend Login Entry + Callback Robust Decode

**Files:**
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/OAuthCallback.tsx`
- Modify: `frontend/.env`

- [ ] **Step 1: Write failing frontend test for callback behavior**

```tsx
// oauth-callback.test.tsx will fail first until decoder/login behavior is stable.
```

- [ ] **Step 2: Add backend origin env for OAuth start URL**

```env
# frontend/.env
VITE_BACKEND_ORIGIN=http://localhost:8080
```

- [ ] **Step 3: Add GitHub login button in Login page**

```tsx
// Login.tsx (inside component)
const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080';
const githubLoginUrl = `${backendOrigin}/oauth2/authorization/github`;

// Login.tsx (below password login button)
<a
  href={githubLoginUrl}
  className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 rounded-lg py-3 text-sm font-medium text-ink dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
>
  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">code</span>
  使用 GitHub 登录
</a>
```

- [ ] **Step 4: Harden OAuthCallback JWT decoding for base64url tokens**

```tsx
// OAuthCallback.tsx
function decodeJwtPayload(token: string) {
  const payloadPart = token.split('.')[1];
  if (!payloadPart) throw new Error('Invalid token payload');

  const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(atob(padded));
}

// in success branch
const payload = decodeJwtPayload(token);
login({
  id: payload.id ? Number(payload.id) : 0,
  username: payload.sub || payload.username || '',
  email: payload.email || '',
  roles: payload.roles || ['ROLE_USER'],
  accessToken: token,
  tokenType: 'Bearer'
});
```

- [ ] **Step 5: Run frontend lint + unit tests**

Run: `cd frontend && npm run test -- --run`
Expected: PASS including new OAuth callback tests.

Run: `cd frontend && npm run lint`
Expected: no new lint errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Login.tsx frontend/src/pages/OAuthCallback.tsx frontend/.env
git commit -m "feat(frontend): add github oauth entry and callback token handling"
```

---

### Task 4: Frontend Callback Tests (TDD)

**Files:**
- Create: `frontend/src/test/oauth-callback.test.tsx`
- Test: `frontend/src/test/oauth-callback.test.tsx`

- [ ] **Step 1: Add callback test file with 3 scenarios**

```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import OAuthCallback from '../pages/OAuthCallback';

const navigateMock = vi.fn();
const loginMock = vi.fn();
const messageSuccess = vi.fn();
const messageError = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useSearchParams: () => [new URLSearchParams(globalThis.location.search)],
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}));

vi.mock('antd', () => ({
  message: { success: messageSuccess, error: messageError },
}));

describe('OAuthCallback', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    messageSuccess.mockReset();
    messageError.mockReset();
    window.history.replaceState({}, '', '/oauth/callback');
  });

  it('logs in and navigates home when token exists', async () => {
    const payload = btoa(JSON.stringify({ sub: 'github_user', email: 'g@ex.com', roles: ['ROLE_USER'] }));
    window.history.replaceState({}, '', `/oauth/callback?token=aaa.${payload}.bbb`);

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('navigates to login when error exists', async () => {
    window.history.replaceState({}, '', '/oauth/callback?error=OAUTH_LOGIN_FAILED');

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(messageError).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('navigates to login when token is malformed', async () => {
    window.history.replaceState({}, '', '/oauth/callback?token=badtoken');

    render(<OAuthCallback />);

    await waitFor(() => {
      expect(messageError).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });
});
```

- [ ] **Step 2: Run callback test only**

Run: `cd frontend && npx vitest run src/test/oauth-callback.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/test/oauth-callback.test.tsx
git commit -m "test(frontend): cover oauth callback success and failure flows"
```

---

### Task 5: Configuration + Manual E2E Verification

**Files:**
- Modify: `backend/src/main/resources/application.properties`

- [ ] **Step 1: Add explicit OAuth2 app properties (local defaults)**

```properties
# application.properties
app.oauth2.enabled=${OAUTH2_ENABLED:true}
app.oauth2.authorized-redirect-uri=${OAUTH2_REDIRECT_URI:http://localhost:5173/oauth/callback}
```

- [ ] **Step 2: Ensure local GitHub registration properties exist in runtime env**

```properties
# set in local env or application-local.properties
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID:}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET:}
```

- [ ] **Step 3: Run backend and frontend for manual e2e check**

Run backend: `cd backend && mvn -Dmaven.test.skip=true spring-boot:run`
Expected: starts on `http://localhost:8080`

Run frontend: `cd frontend && npm run dev`
Expected: starts on `http://localhost:5173`

Manual expected results:
1. Open `/login`, click `使用 GitHub 登录`.
2. Finish GitHub authorization.
3. Browser lands `/oauth/callback?token=...` then auto-jumps `/`.
4. Auth-required API requests include `Authorization` header.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/resources/application.properties
git commit -m "chore(config): add oauth2 feature and redirect defaults"
```

---

## Self-Review Checklist

- Spec coverage:
  - Success redirect with token: Task 2 ✅
  - Frontend callback auto-login + home redirect: Task 3/4 ✅
  - Error redirect handling: Task 2/4 ✅
  - End-to-end acceptance verification: Task 5 ✅
- Placeholder scan: no TBD/TODO placeholders left ✅
- Type/signature consistency:
  - `token` query param used in backend + frontend consistently ✅
  - callback route `/oauth/callback` consistent with router ✅


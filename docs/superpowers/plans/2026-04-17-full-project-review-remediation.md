# Full-Project Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the highest-signal security, payment, configuration, and user-flow issues identified in the full-project review while keeping changes small, testable, and defense-ready.

**Architecture:** Apply the review findings in prioritized batches instead of one large refactor. Start with backend authorization boundaries and payment authority, then fix production configuration drift and frontend flow resilience, and finally tighten DTO validation and exception semantics.

**Tech Stack:** Spring Boot 3, Spring Security, JUnit 5, Mockito, React 19, TypeScript, Vite, Axios

---

## File map

### Batch 1 — Order authorization hardening
- Modify: `backend/src/main/java/com/bookstore/controller/OrderController.java`
- Reuse: `backend/src/main/java/com/bookstore/security/SecurityUtils.java`
- Test: `backend/src/test/java/com/bookstore/controller/OrderControllerAuthorizationTest.java` (new)
- Regression: `backend/src/test/java/com/bookstore/controller/PaymentControllerAuthorizationTest.java`

### Batch 2 — Payment authority and response tightening
- Modify: `backend/src/main/java/com/bookstore/controller/PaymentController.java`
- Modify: `frontend/src/pages/Payment.tsx`
- Modify: `frontend/src/pages/PaymentReturn.tsx`
- Test: `backend/src/test/java/com/bookstore/controller/PaymentControllerAuthorizationTest.java`
- Optional frontend verification: browser payment return / payment page flows

### Batch 3 — Upload path configuration alignment
- Modify: `backend/src/main/java/com/bookstore/config/WebConfig.java`
- Modify: `backend/src/main/java/com/bookstore/controller/UploadController.java`
- Reuse: `backend/src/main/resources/application.properties`
- Reuse: `backend/src/main/resources/application-prod.properties`
- Modify: `README.md`

### Batch 4 — Login, 401 redirect, and checkout resilience
- Modify: `frontend/src/api/index.ts`
- Modify: `frontend/src/components/ProtectedRoute.tsx`
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Checkout.tsx`
- Optional supporting reads: auth/cart context files if needed during execution

### Batch 5 — DTO validation and API semantics cleanup
- Modify: `backend/src/main/java/com/bookstore/payload/request/AddressRequest.java`
- Modify: `backend/src/main/java/com/bookstore/service/AddressService.java`
- Modify: `backend/src/main/java/com/bookstore/payload/request/ReviewRequest.java`
- Modify: `backend/src/main/java/com/bookstore/controller/ReviewController.java`
- Modify: `backend/src/main/java/com/bookstore/entity/Review.java`
- Modify: `backend/src/main/java/com/bookstore/controller/UserController.java`
- Modify: `backend/src/main/java/com/bookstore/controller/OrderController.java`
- Modify: `backend/src/main/java/com/bookstore/service/OrderService.java`
- Test: targeted controller/service/exception tests added per sub-batch

---

### Task 1: Harden order authorization boundaries

**Files:**
- Modify: `backend/src/main/java/com/bookstore/controller/OrderController.java`
- Create: `backend/src/test/java/com/bookstore/controller/OrderControllerAuthorizationTest.java`
- Test: `backend/src/test/java/com/bookstore/controller/PaymentControllerAuthorizationTest.java`

- [ ] **Step 1: Write failing authorization tests for order endpoints**
- [ ] **Step 2: Run the order authorization tests and confirm they fail for the missing checks**
- [ ] **Step 3: Add owner/admin checks to order detail and user-order endpoints, and admin-only checks to batch status updates**
- [ ] **Step 4: Re-run the new order authorization tests and verify they pass**
- [ ] **Step 5: Run focused regressions for adjacent payment/user authorization behavior**

### Task 2: Make backend payment state authoritative

**Files:**
- Modify: `backend/src/main/java/com/bookstore/controller/PaymentController.java`
- Modify: `frontend/src/pages/Payment.tsx`
- Modify: `frontend/src/pages/PaymentReturn.tsx`
- Test: `backend/src/test/java/com/bookstore/controller/PaymentControllerAuthorizationTest.java`

- [ ] **Step 1: Write failing backend tests for refund authorization and invalid refund amount semantics**
- [ ] **Step 2: Run the payment controller tests and confirm the new cases fail**
- [ ] **Step 3: Restrict refund to admin-only, validate refund amount as client input, and replace raw internal error messages with stable responses**
- [ ] **Step 4: Remove frontend-side order status mutation from payment pages so they only display backend-confirmed status**
- [ ] **Step 5: Re-run payment tests and manually verify the frontend payment happy path still works**

### Task 3: Wire upload paths to real configuration

**Files:**
- Modify: `backend/src/main/java/com/bookstore/config/WebConfig.java`
- Modify: `backend/src/main/java/com/bookstore/controller/UploadController.java`
- Modify: `README.md`

- [ ] **Step 1: Add a focused test or small verification target for configured upload directory resolution if existing patterns support it**
- [ ] **Step 2: Replace `System.getProperty("user.dir")` upload path derivation with `app.upload.dir` configuration plus a safe local default**
- [ ] **Step 3: Update README to match the real runtime behavior for dev and production uploads**
- [ ] **Step 4: Run targeted backend tests or startup checks covering upload path wiring**
- [ ] **Step 5: Confirm `application-prod.properties` and README now describe the same behavior**

### Task 4: Stabilize auth-expiry and checkout return flows

**Files:**
- Modify: `frontend/src/api/index.ts`
- Modify: `frontend/src/components/ProtectedRoute.tsx`
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Checkout.tsx`

- [ ] **Step 1: Add or update frontend tests for preserved return paths and checkout recovery where the existing test setup supports it**
- [ ] **Step 2: Update login success handling to respect `location.state.from` before using role-based defaults**
- [ ] **Step 3: Update the 401 interceptor flow to preserve the user’s destination instead of blindly redirecting to `/login`**
- [ ] **Step 4: Refactor checkout to recover required data from stable sources when route state is absent**
- [ ] **Step 5: Run frontend tests and verify login → checkout → payment flows in the browser**

### Task 5: Tighten request validation and semantic consistency

**Files:**
- Modify: `backend/src/main/java/com/bookstore/payload/request/AddressRequest.java`
- Modify: `backend/src/main/java/com/bookstore/service/AddressService.java`
- Modify: `backend/src/main/java/com/bookstore/payload/request/ReviewRequest.java`
- Modify: `backend/src/main/java/com/bookstore/controller/ReviewController.java`
- Modify: `backend/src/main/java/com/bookstore/entity/Review.java`
- Modify: `backend/src/main/java/com/bookstore/controller/OrderController.java`
- Modify: `backend/src/main/java/com/bookstore/service/OrderService.java`
- Modify: `backend/src/main/java/com/bookstore/controller/UserController.java`

- [ ] **Step 1: Add failing tests for address validation, review request shape, and the highest-signal order/user exception-semantics gaps**
- [ ] **Step 2: Run those tests and confirm they fail for the right reasons**
- [ ] **Step 3: Add bean validation to `AddressRequest` and remove misleading `userId` input from review creation**
- [ ] **Step 4: Add a database-level uniqueness constraint for reviews and keep the existing application-level duplicate check**
- [ ] **Step 5: Continue replacing generic `RuntimeException` / ad-hoc 400 responses in Order and User flows with explicit semantic exceptions, then re-run focused regressions**

---

## Recommended execution order
1. Task 1 — Order authorization hardening
2. Task 2 — Payment authority and response tightening
3. Task 3 — Upload path configuration alignment
4. Task 4 — Auth-expiry and checkout resilience
5. Task 5 — DTO validation and semantic cleanup

## Notes for execution
- Keep each batch small and test-driven.
- Do not mix unrelated cleanups into these tasks.
- Prefer focused regression suites after each batch instead of full-suite runs every time.
- After finishing each batch, reassess whether the next batch still has the highest reviewer-facing value.

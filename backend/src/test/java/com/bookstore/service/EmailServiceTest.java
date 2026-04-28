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

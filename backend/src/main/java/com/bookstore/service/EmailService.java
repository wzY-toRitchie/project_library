package com.bookstore.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import com.bookstore.exception.BadRequestException;

import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class EmailService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.email.mock:true}")
    private boolean mockMode;

    @Value("${app.email.code-expiration-minutes:5}")
    private int codeExpirationMinutes;

    @Value("${app.email.send-interval-seconds:60}")
    private int sendIntervalSeconds;

    private final JavaMailSender mailSender;

    // 验证码存储：邮箱 -> 验证码条目
    private final ConcurrentHashMap<String, VerificationEntry> codeStore = new ConcurrentHashMap<>();

    // 发送频率限制：邮箱 -> 上次发送时间
    private final ConcurrentHashMap<String, LocalDateTime> lastSendTime = new ConcurrentHashMap<>();

    // 验证码条目（使用内部类以访问外部类的 codeExpirationMinutes 字段）
    private class VerificationEntry {
        final String code;
        final LocalDateTime createTime;

        VerificationEntry(String code, LocalDateTime createTime) {
            this.code = code;
            this.createTime = createTime;
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(createTime.plusMinutes(codeExpirationMinutes));
        }
    }

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * 发送验证码
     * @param email 目标邮箱
     * @throws BadRequestException 频率限制或发送失败
     */
    public void sendVerificationCode(String email) {
        // 检查发送频率限制（如果已有验证码已过期则不限制）
        VerificationEntry existingEntry = codeStore.get(email);
        if (existingEntry == null || !existingEntry.isExpired()) {
            LocalDateTime lastSend = lastSendTime.get(email);
            if (lastSend != null && LocalDateTime.now().isBefore(lastSend.plusSeconds(sendIntervalSeconds))) {
                throw new BadRequestException("发送过于频繁，请稍后再试");
            }
        }

        // 生成 6 位数字验证码
        String code = mockMode ? "123456" : generateCode();

        // 存储验证码（含创建时间，过期判断动态基于 codeExpirationMinutes）
        LocalDateTime createTime = LocalDateTime.now();
        codeStore.put(email, new VerificationEntry(code, createTime));

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
        return entry.code.equals(code);
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
        return String.format("%06d", SECURE_RANDOM.nextInt(1000000));
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
    }
}

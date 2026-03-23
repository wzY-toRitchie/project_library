package com.bookstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    @Value("${app.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.login.lock-duration-minutes:15}")
    private int lockDurationMinutes;

    private final ConcurrentHashMap<String, LoginAttempt> attemptsCache = new ConcurrentHashMap<>();

    /**
     * 检查用户是否被锁定
     */
    public boolean isBlocked(String username) {
        LoginAttempt attempt = attemptsCache.get(username);
        if (attempt == null) {
            return false;
        }

        // 检查锁定是否过期
        if (attempt.getLockTime() != null) {
            if (LocalDateTime.now().isAfter(attempt.getLockTime().plusMinutes(lockDurationMinutes))) {
                // 锁定已过期，重置
                attemptsCache.remove(username);
                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * 获取剩余锁定时间（分钟）
     */
    public long getRemainingLockTime(String username) {
        LoginAttempt attempt = attemptsCache.get(username);
        if (attempt == null || attempt.getLockTime() == null) {
            return 0;
        }
        
        LocalDateTime unlockTime = attempt.getLockTime().plusMinutes(lockDurationMinutes);
        long remainingMinutes = java.time.Duration.between(LocalDateTime.now(), unlockTime).toMinutes();
        return Math.max(0, remainingMinutes);
    }

    /**
     * 获取剩余尝试次数
     */
    public int getRemainingAttempts(String username) {
        LoginAttempt attempt = attemptsCache.get(username);
        if (attempt == null) {
            return maxAttempts;
        }
        return Math.max(0, maxAttempts - attempt.getAttempts());
    }

    /**
     * 记录登录失败
     */
    public void loginFailed(String username) {
        LoginAttempt attempt = attemptsCache.getOrDefault(username, new LoginAttempt());
        attempt.incrementAttempts();
        
        // 超过最大尝试次数，锁定账户
        if (attempt.getAttempts() >= maxAttempts) {
            attempt.setLockTime(LocalDateTime.now());
        }
        
        attemptsCache.put(username, attempt);
    }

    /**
     * 登录成功，重置失败次数
     */
    public void loginSucceeded(String username) {
        attemptsCache.remove(username);
    }

    /**
     * 内部类：登录尝试记录
     */
    private static class LoginAttempt {
        private int attempts;
        private LocalDateTime lockTime;

        public LoginAttempt() {
            this.attempts = 0;
            this.lockTime = null;
        }

        public int getAttempts() {
            return attempts;
        }

        public void incrementAttempts() {
            this.attempts++;
        }

        public LocalDateTime getLockTime() {
            return lockTime;
        }

        public void setLockTime(LocalDateTime lockTime) {
            this.lockTime = lockTime;
        }
    }
}

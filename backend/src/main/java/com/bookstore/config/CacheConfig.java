package com.bookstore.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // 使用 Spring Boot 默认的 ConcurrentMapCacheManager
    // 生产环境建议使用 Redis 或 Ehcache
}

package com.bookstore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.ai.openrouter")
public class AiConfig {
    private String apiKey = "";
    private String baseUrl = "https://openrouter.ai/api/v1";
    private String model = "openrouter/free";
    private boolean mock = false;
}

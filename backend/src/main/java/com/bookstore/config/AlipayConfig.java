package com.bookstore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.alipay")
public class AlipayConfig {
    private String appId = "";
    private String privateKey = "";
    private String alipayPublicKey = "";
    private String gateway = "https://openapi-sandbox.dl.alipaydev.com/gateway.do";
    private String returnUrl = "http://localhost:5173/payment/return";
    private String notifyUrl = "http://localhost:8080/api/payment/notify";
    private String signType = "RSA2";
    private boolean sandbox = true;
}
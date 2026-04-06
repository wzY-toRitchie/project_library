package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
public class SystemSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String storeName;
    private String supportEmail;
    private String supportPhone;
    private Integer lowStockThreshold;
    private String dashboardRange;

    // AI 荐书设置
    @Column(columnDefinition = "VARCHAR(500) DEFAULT ''")
    private String aiApiKey = "";
    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'openrouter/free'")
    private String aiModel = "openrouter/free";
    @Column(columnDefinition = "VARCHAR(500) DEFAULT 'https://openrouter.ai/api/v1'")
    private String aiBaseUrl = "https://openrouter.ai/api/v1";
    @Column(columnDefinition = "DOUBLE DEFAULT 0.7")
    private Double aiTemperature = 0.7;
    @Column(columnDefinition = "INT DEFAULT 2000")
    private Integer aiMaxTokens = 2000;
    @Column(columnDefinition = "TEXT")
    private String aiSystemPrompt;
}

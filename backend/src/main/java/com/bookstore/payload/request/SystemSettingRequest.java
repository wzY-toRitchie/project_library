package com.bookstore.payload.request;

import lombok.Data;

@Data
public class SystemSettingRequest {
    private String storeName;
    private String supportEmail;
    private String supportPhone;
    private Integer lowStockThreshold;
    private String dashboardRange;

    // AI 荐书设置
    private String aiApiKey;
    private String aiModel;
    private String aiBaseUrl;
    private Double aiTemperature;
    private Integer aiMaxTokens;
    private Boolean aiMock;
}

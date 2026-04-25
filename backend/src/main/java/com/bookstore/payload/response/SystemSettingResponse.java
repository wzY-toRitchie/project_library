package com.bookstore.payload.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SystemSettingResponse {
    private String storeName;
    private String supportEmail;
    private String supportPhone;
    private Integer lowStockThreshold;
    private String dashboardRange;
    private String aiModel;
    private String aiBaseUrl;
    private Double aiTemperature;
    private Integer aiMaxTokens;
    private String aiSystemPrompt;

    public SystemSettingResponse(String storeName, String supportEmail, String supportPhone,
            Integer lowStockThreshold, String dashboardRange, String aiModel, String aiBaseUrl,
            Double aiTemperature, Integer aiMaxTokens, String aiSystemPrompt) {
        this.storeName = storeName;
        this.supportEmail = supportEmail;
        this.supportPhone = supportPhone;
        this.lowStockThreshold = lowStockThreshold;
        this.dashboardRange = dashboardRange;
        this.aiModel = aiModel;
        this.aiBaseUrl = aiBaseUrl;
        this.aiTemperature = aiTemperature;
        this.aiMaxTokens = aiMaxTokens;
        this.aiSystemPrompt = aiSystemPrompt;
    }
}

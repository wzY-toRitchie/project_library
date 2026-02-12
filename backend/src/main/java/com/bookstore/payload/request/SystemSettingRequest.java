package com.bookstore.payload.request;

import lombok.Data;

@Data
public class SystemSettingRequest {
    private String storeName;
    private String supportEmail;
    private String supportPhone;
    private Integer lowStockThreshold;
    private String dashboardRange;
}

package com.bookstore.enums;

public enum NotificationType {
    STOCK("库存预警"),
    ORDER("新订单"),
    USER("用户消息");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

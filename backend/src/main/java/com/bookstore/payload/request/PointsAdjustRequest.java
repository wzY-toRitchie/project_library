package com.bookstore.payload.request;

import lombok.Data;

@Data
public class PointsAdjustRequest {
    private Long userId;
    private Integer points;
    private String reason;
}

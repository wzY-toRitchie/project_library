package com.bookstore.payload.response;

import com.bookstore.entity.Coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PublicCouponResponse {
    private Long id;
    private String name;
    private String type;
    private BigDecimal minAmount;
    private BigDecimal value;
    private LocalDateTime endTime;

    public PublicCouponResponse(Long id, String name, String type, BigDecimal minAmount, BigDecimal value,
            LocalDateTime endTime) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.minAmount = minAmount;
        this.value = value;
        this.endTime = endTime;
    }

    public static PublicCouponResponse from(Coupon coupon) {
        return new PublicCouponResponse(
                coupon.getId(),
                coupon.getName(),
                coupon.getType(),
                coupon.getMinAmount(),
                coupon.getValue(),
                coupon.getEndTime());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public BigDecimal getMinAmount() {
        return minAmount;
    }

    public BigDecimal getValue() {
        return value;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
}

package com.bookstore.payload.response;

import com.bookstore.entity.UserCoupon;

import java.time.LocalDateTime;

public class UserCouponResponse {
    private Long id;
    private PublicCouponResponse coupon;
    private Long orderId;
    private String status;
    private LocalDateTime getTime;
    private LocalDateTime useTime;
    private boolean available;

    public UserCouponResponse(Long id, PublicCouponResponse coupon, Long orderId, String status, LocalDateTime getTime,
            LocalDateTime useTime, boolean available) {
        this.id = id;
        this.coupon = coupon;
        this.orderId = orderId;
        this.status = status;
        this.getTime = getTime;
        this.useTime = useTime;
        this.available = available;
    }

    public static UserCouponResponse from(UserCoupon userCoupon) {
        return new UserCouponResponse(
                userCoupon.getId(),
                PublicCouponResponse.from(userCoupon.getCoupon()),
                userCoupon.getOrderId(),
                userCoupon.getStatus(),
                userCoupon.getGetTime(),
                userCoupon.getUseTime(),
                userCoupon.isAvailable());
    }

    public Long getId() {
        return id;
    }

    public PublicCouponResponse getCoupon() {
        return coupon;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getGetTime() {
        return getTime;
    }

    public LocalDateTime getUseTime() {
        return useTime;
    }

    public boolean isAvailable() {
        return available;
    }
}

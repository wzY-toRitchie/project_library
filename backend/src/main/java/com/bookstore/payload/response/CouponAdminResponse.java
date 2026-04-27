package com.bookstore.payload.response;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.CouponPointsRule;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponAdminResponse {
    private Long id;
    private String code;
    private String name;
    private String type;
    private BigDecimal minAmount;
    private BigDecimal value;
    private Integer totalCount;
    private Integer usedCount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime createTime;
    private boolean available;
    private CouponPointsRuleSummaryResponse pointsRule;

    public CouponAdminResponse(Coupon coupon, CouponPointsRule pointsRule) {
        this.id = coupon.getId();
        this.code = coupon.getCode();
        this.name = coupon.getName();
        this.type = coupon.getType();
        this.minAmount = coupon.getMinAmount();
        this.value = coupon.getValue();
        this.totalCount = coupon.getTotalCount();
        this.usedCount = coupon.getUsedCount();
        this.startTime = coupon.getStartTime();
        this.endTime = coupon.getEndTime();
        this.status = coupon.getStatus();
        this.createTime = coupon.getCreateTime();
        this.available = coupon.isAvailable();
        this.pointsRule = pointsRule == null ? null : CouponPointsRuleSummaryResponse.from(pointsRule);
    }

    public static CouponAdminResponse from(Coupon coupon, CouponPointsRule pointsRule) {
        return new CouponAdminResponse(coupon, pointsRule);
    }

    public Long getId() { return id; }

    public String getCode() { return code; }

    public String getName() { return name; }

    public String getType() { return type; }

    public BigDecimal getMinAmount() { return minAmount; }

    public BigDecimal getValue() { return value; }

    public Integer getTotalCount() { return totalCount; }

    public Integer getUsedCount() { return usedCount; }

    public LocalDateTime getStartTime() { return startTime; }

    public LocalDateTime getEndTime() { return endTime; }

    public String getStatus() { return status; }

    public LocalDateTime getCreateTime() { return createTime; }

    public boolean isAvailable() { return available; }

    public CouponPointsRuleSummaryResponse getPointsRule() { return pointsRule; }
}

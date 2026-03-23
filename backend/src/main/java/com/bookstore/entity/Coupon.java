package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupon_code", columnList = "code"),
    @Index(name = "idx_coupon_status", columnList = "status")
})
@Data
@NoArgsConstructor
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String type; // FULL_REDUCE, DISCOUNT, FREE_SHIPPING

    @Column(name = "min_amount")
    private BigDecimal minAmount; // 满减门槛

    @Column(nullable = false)
    private BigDecimal value; // 优惠金额/折扣率

    @Column(name = "total_count", nullable = false)
    private Integer totalCount;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, DISABLED

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }

    public Coupon(String code, String name, String type, BigDecimal value, Integer totalCount, LocalDateTime startTime, LocalDateTime endTime) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.value = value;
        this.totalCount = totalCount;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Coupon(String code, String name, String type, BigDecimal minAmount, BigDecimal value, Integer totalCount, LocalDateTime startTime, LocalDateTime endTime) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.minAmount = minAmount;
        this.value = value;
        this.totalCount = totalCount;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    /**
     * 检查优惠券是否可用
     */
    public boolean isAvailable() {
        if (!"ACTIVE".equals(status)) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(startTime) && now.isBefore(endTime) && usedCount < totalCount;
    }

    /**
     * 计算优惠金额
     */
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isAvailable()) {
            return BigDecimal.ZERO;
        }
        if (minAmount != null && orderAmount.compareTo(minAmount) < 0) {
            return BigDecimal.ZERO;
        }
        if ("FULL_REDUCE".equals(type)) {
            return value;
        } else if ("DISCOUNT".equals(type)) {
            // 折扣率，如 0.8 表示八折
            return orderAmount.multiply(BigDecimal.ONE.subtract(value));
        }
        return BigDecimal.ZERO;
    }
}

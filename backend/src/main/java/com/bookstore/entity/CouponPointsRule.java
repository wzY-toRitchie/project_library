package com.bookstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_points_rules", indexes = {
        @Index(name = "idx_coupon_points_rule", columnList = "coupon_id", unique = true)
})
@Data
@NoArgsConstructor
public class CouponPointsRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "coupon_id", nullable = false, unique = true)
    @JsonIgnore
    private Coupon coupon;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    @Column(name = "max_daily_redeem", nullable = false)
    private Integer maxDailyRedeem = 1;

    @Column(name = "total_redeemed", nullable = false)
    private Integer totalRedeemed = 0;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = createTime;
        if (maxDailyRedeem == null) maxDailyRedeem = 1;
        if (totalRedeemed == null) totalRedeemed = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    public CouponPointsRule(Coupon coupon, Integer pointsCost, Integer maxDailyRedeem) {
        this.coupon = coupon;
        this.pointsCost = pointsCost;
        this.maxDailyRedeem = maxDailyRedeem != null ? maxDailyRedeem : 1;
        this.totalRedeemed = 0;
    }
}

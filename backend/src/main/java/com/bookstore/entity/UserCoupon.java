package com.bookstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons", indexes = {
    @Index(name = "idx_user_coupon_user", columnList = "user_id"),
    @Index(name = "idx_user_coupon_coupon", columnList = "coupon_id"),
    @Index(name = "idx_user_coupon_status", columnList = "status")
})
@Data
@NoArgsConstructor
public class UserCoupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Column(name = "order_id")
    private Long orderId;

    @Column(nullable = false, length = 20)
    private String status = "UNUSED"; // UNUSED, USED, EXPIRED

    @Column(name = "get_time")
    private LocalDateTime getTime;

    @Column(name = "use_time")
    private LocalDateTime useTime;

    @PrePersist
    protected void onCreate() {
        getTime = LocalDateTime.now();
    }

    public UserCoupon(User user, Coupon coupon) {
        this.user = user;
        this.coupon = coupon;
    }

    /**
     * 标记为已使用
     */
    public void markAsUsed(Long orderId) {
        this.status = "USED";
        this.orderId = orderId;
        this.useTime = LocalDateTime.now();
    }

    /**
     * 检查是否可用
     */
    public boolean isAvailable() {
        if (!"UNUSED".equals(status)) {
            return false;
        }
        return coupon.isAvailable();
    }
}

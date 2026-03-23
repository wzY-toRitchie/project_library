package com.bookstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "points_history", indexes = {
    @Index(name = "idx_points_user_time", columnList = "user_id, create_time DESC")
})
@Data
@NoArgsConstructor
public class PointsHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false, length = 50)
    private String type; // REGISTER, PURCHASE, REVIEW, SIGN_IN, DEDUCT

    @Column(length = 255)
    private String description;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }

    public PointsHistory(User user, Integer points, String type, String description) {
        this.user = user;
        this.points = points;
        this.type = type;
        this.description = description;
    }

    public PointsHistory(User user, Integer points, String type, String description, Long orderId) {
        this.user = user;
        this.points = points;
        this.type = type;
        this.description = description;
        this.orderId = orderId;
    }
}

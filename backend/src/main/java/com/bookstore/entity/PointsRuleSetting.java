package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "points_rule_settings", indexes = {
        @Index(name = "idx_rule_key", columnList = "rule_key", unique = true)
})
@Data
@NoArgsConstructor
public class PointsRuleSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_key", nullable = false, unique = true, length = 50)
    private String ruleKey;

    @Column(name = "rule_value", nullable = false)
    private Integer ruleValue;

    @Column(columnDefinition = "VARCHAR(255)")
    private String description;

    @Column(name = "updater", length = 50)
    private String updater;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = createTime;
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}

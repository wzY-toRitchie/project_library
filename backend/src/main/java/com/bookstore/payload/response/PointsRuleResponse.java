package com.bookstore.payload.response;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PointsRuleResponse {
    private String ruleKey;
    private Integer ruleValue;
    private String description;
    private LocalDateTime updateTime;
    private String updater;

    public PointsRuleResponse(String ruleKey, Integer ruleValue, String description, LocalDateTime updateTime, String updater) {
        this.ruleKey = ruleKey;
        this.ruleValue = ruleValue;
        this.description = description;
        this.updateTime = updateTime;
        this.updater = updater;
    }
}

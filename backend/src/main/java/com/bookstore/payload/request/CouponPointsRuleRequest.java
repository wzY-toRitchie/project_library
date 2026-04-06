package com.bookstore.payload.request;

import lombok.Data;

@Data
public class CouponPointsRuleRequest {
    private Integer pointsCost;
    private Integer maxDailyRedeem;
}

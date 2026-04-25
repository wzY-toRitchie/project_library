package com.bookstore.payload.response;

import com.bookstore.entity.CouponPointsRule;

public class CouponPointsRuleSummaryResponse {
    private Integer pointsCost;
    private Integer maxDailyRedeem;

    public CouponPointsRuleSummaryResponse(Integer pointsCost, Integer maxDailyRedeem) {
        this.pointsCost = pointsCost;
        this.maxDailyRedeem = maxDailyRedeem;
    }

    public static CouponPointsRuleSummaryResponse from(CouponPointsRule rule) {
        return new CouponPointsRuleSummaryResponse(rule.getPointsCost(), rule.getMaxDailyRedeem());
    }

    public Integer getPointsCost() {
        return pointsCost;
    }

    public Integer getMaxDailyRedeem() {
        return maxDailyRedeem;
    }
}

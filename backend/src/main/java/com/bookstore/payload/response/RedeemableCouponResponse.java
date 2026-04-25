package com.bookstore.payload.response;

public class RedeemableCouponResponse {
    private PublicCouponResponse coupon;
    private CouponPointsRuleSummaryResponse pointsRule;

    public RedeemableCouponResponse(PublicCouponResponse coupon, CouponPointsRuleSummaryResponse pointsRule) {
        this.coupon = coupon;
        this.pointsRule = pointsRule;
    }

    public PublicCouponResponse getCoupon() {
        return coupon;
    }

    public CouponPointsRuleSummaryResponse getPointsRule() {
        return pointsRule;
    }
}

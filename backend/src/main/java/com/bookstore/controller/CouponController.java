package com.bookstore.controller;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.UserCoupon;
import com.bookstore.payload.request.CouponPointsRuleRequest;
import com.bookstore.payload.response.CouponAdminResponse;
import com.bookstore.payload.response.PublicCouponResponse;
import com.bookstore.payload.response.RedeemableCouponResponse;
import com.bookstore.payload.response.UserCouponResponse;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@Tag(name = "优惠券", description = "优惠券管理、领取和积分兑换接口")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Operation(summary = "获取所有可用优惠券", description = "获取当前可用的优惠券列表，供用户领取")
    @GetMapping
    public ResponseEntity<List<PublicCouponResponse>> getAvailableCoupons() {
        List<PublicCouponResponse> coupons = couponService.getAvailableCoupons().stream()
                .map(PublicCouponResponse::from)
                .toList();
        return ResponseEntity.ok(coupons);
    }

    @Operation(summary = "获取所有优惠券", description = "管理员获取全部优惠券列表（含已下架）")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponAdminResponse>> getAllCoupons() {
        List<CouponAdminResponse> coupons = couponService.getAllCoupons().stream()
                .map(coupon -> CouponAdminResponse.from(
                        coupon,
                        couponService.getPointsRuleForCoupon(coupon.getId()).orElse(null)))
                .toList();
        return ResponseEntity.ok(coupons);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponAdminResponse> getCoupon(@PathVariable("id") Long id) {
        Coupon coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(CouponAdminResponse.from(
                coupon,
                couponService.getPointsRuleForCoupon(id).orElse(null)));
    }

    @Operation(summary = "获取我的优惠券", description = "获取当前用户所有已领取的优惠券")
    @GetMapping("/my")
    public ResponseEntity<List<UserCouponResponse>> getMyCoupons() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<UserCouponResponse> userCoupons = couponService.getUserCoupons(userId).stream()
                .map(UserCouponResponse::from)
                .toList();
        return ResponseEntity.ok(userCoupons);
    }

    @Operation(summary = "获取我的可用优惠券", description = "获取当前用户已领取且未使用的优惠券")
    @GetMapping("/available")
    public ResponseEntity<List<UserCouponResponse>> getAvailableUserCoupons() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<UserCouponResponse> userCoupons = couponService.getAvailableUserCoupons(userId).stream()
                .map(UserCouponResponse::from)
                .toList();
        return ResponseEntity.ok(userCoupons);
    }

    @Operation(summary = "领取优惠券", description = "当前用户领取指定优惠券")
    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimCoupon(@PathVariable("id") @Parameter(description = "优惠券ID") Long id) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            UserCoupon userCoupon = couponService.claimCoupon(userId, id);
            return ResponseEntity.ok(UserCouponResponse.from(userCoupon));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "创建优惠券", description = "管理员新增优惠券（可选配置积分兑换规则）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> request) {
        try {
            Coupon coupon = parseCouponFromRequest(request);
            CouponPointsRuleRequest pointsRule = null;
            if (request.containsKey("pointsRule") && request.get("pointsRule") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> ruleMap = (Map<String, Object>) request.get("pointsRule");
                pointsRule = new CouponPointsRuleRequest();
                if (ruleMap.get("pointsCost") != null) {
                    pointsRule.setPointsCost(Integer.parseInt(ruleMap.get("pointsCost").toString()));
                }
                if (ruleMap.get("maxDailyRedeem") != null) {
                    pointsRule.setMaxDailyRedeem(Integer.parseInt(ruleMap.get("maxDailyRedeem").toString()));
                }
            }
            Coupon created = couponService.createCoupon(coupon, pointsRule);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "更新优惠券", description = "管理员修改指定优惠券的信息（含积分兑换规则）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCoupon(@PathVariable("id") @Parameter(description = "优惠券ID") Long id, @RequestBody Map<String, Object> request) {
        try {
            Coupon coupon = parseCouponFromRequest(request);
            CouponPointsRuleRequest pointsRule = null;
            if (request.containsKey("pointsRule") && request.get("pointsRule") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> ruleMap = (Map<String, Object>) request.get("pointsRule");
                pointsRule = new CouponPointsRuleRequest();
                if (ruleMap.get("pointsCost") != null) {
                    pointsRule.setPointsCost(Integer.parseInt(ruleMap.get("pointsCost").toString()));
                }
                if (ruleMap.get("maxDailyRedeem") != null) {
                    pointsRule.setMaxDailyRedeem(Integer.parseInt(ruleMap.get("maxDailyRedeem").toString()));
                }
            }
            Coupon updated = couponService.updateCoupon(id, coupon, pointsRule);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "删除优惠券", description = "管理员删除指定优惠券")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable("id") @Parameter(description = "优惠券ID") Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "应用优惠券", description = "在订单结算时应用优惠券，返回优惠金额")
    @PostMapping("/apply")
    public ResponseEntity<?> applyCoupon(@RequestBody Map<String, Object> request) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            Long userCouponId = Long.valueOf(request.get("userCouponId").toString());
            BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());

            BigDecimal discount = couponService.useCoupon(userId, userCouponId, orderAmount, null);

            Map<String, Object> response = new HashMap<>();
            response.put("discount", discount);
            response.put("message", "优惠券应用成功");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "积分兑换优惠券", description = "使用积分兑换指定优惠券")
    @PostMapping("/{id}/redeem")
    public ResponseEntity<?> redeemCoupon(@PathVariable("id") @Parameter(description = "优惠券ID") Long id) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            UserCoupon userCoupon = couponService.redeemCouponWithPoints(userId, id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "积分兑换成功");
            response.put("userCoupon", UserCouponResponse.from(userCoupon));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "可积分兑换的优惠券列表", description = "获取所有支持积分兑换的优惠券")
    @GetMapping("/redeem")
    public ResponseEntity<List<RedeemableCouponResponse>> getRedeemableCoupons() {
        return ResponseEntity.ok(couponService.getAvailableRedeemCoupons());
    }

    private LocalDateTime parseIsoDateTime(String value) {
        try {
            return LocalDateTime.parse(value);
        } catch (Exception e) {
            try {
                java.time.Instant instant = java.time.Instant.parse(value);
                return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
            } catch (Exception e2) {
                throw new IllegalArgumentException("无效的时间格式: " + value);
            }
        }
    }

    private Coupon parseCouponFromRequest(Map<String, Object> request) {
        Coupon coupon = new Coupon();
        if (request.get("name") != null) coupon.setName(request.get("name").toString());
        if (request.get("code") != null) coupon.setCode(request.get("code").toString());
        if (request.get("type") != null) coupon.setType(request.get("type").toString());
        if (request.get("value") != null) coupon.setValue(new BigDecimal(request.get("value").toString()));
        if (request.get("minAmount") != null) coupon.setMinAmount(new BigDecimal(request.get("minAmount").toString()));
        if (request.get("totalCount") != null) coupon.setTotalCount(Integer.parseInt(request.get("totalCount").toString()));
        if (request.get("status") != null) coupon.setStatus(request.get("status").toString());
        if (request.get("startTime") != null) {
            coupon.setStartTime(parseIsoDateTime(request.get("startTime").toString()));
        }
        if (request.get("endTime") != null) {
            coupon.setEndTime(parseIsoDateTime(request.get("endTime").toString()));
        }
        return coupon;
    }
}

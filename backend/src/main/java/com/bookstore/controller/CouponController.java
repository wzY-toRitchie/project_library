package com.bookstore.controller;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.UserCoupon;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    /**
     * 获取所有可用优惠券
     */
    @GetMapping
    public ResponseEntity<List<Coupon>> getAvailableCoupons() {
        List<Coupon> coupons = couponService.getAvailableCoupons();
        return ResponseEntity.ok(coupons);
    }

    /**
     * 获取我的优惠券
     */
    @GetMapping("/my")
    public ResponseEntity<List<UserCoupon>> getMyCoupons() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<UserCoupon> userCoupons = couponService.getUserCoupons(userId);
        return ResponseEntity.ok(userCoupons);
    }

    /**
     * 获取我的可用优惠券
     */
    @GetMapping("/available")
    public ResponseEntity<List<UserCoupon>> getAvailableUserCoupons() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<UserCoupon> userCoupons = couponService.getAvailableUserCoupons(userId);
        return ResponseEntity.ok(userCoupons);
    }

    /**
     * 领取优惠券
     */
    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimCoupon(@PathVariable Long id) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            UserCoupon userCoupon = couponService.claimCoupon(userId, id);
            return ResponseEntity.ok(userCoupon);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 创建优惠券（管理员）
     */
    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            Coupon created = couponService.createCoupon(coupon);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新优惠券（管理员）
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        try {
            Coupon updated = couponService.updateCoupon(id, coupon);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 删除优惠券（管理员）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 应用优惠券
     */
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
}

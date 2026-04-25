package com.bookstore.service;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.CouponPointsRule;
import com.bookstore.entity.User;
import com.bookstore.entity.UserCoupon;
import com.bookstore.payload.request.CouponPointsRuleRequest;
import com.bookstore.payload.response.CouponPointsRuleSummaryResponse;
import com.bookstore.payload.response.PublicCouponResponse;
import com.bookstore.payload.response.RedeemableCouponResponse;
import com.bookstore.repository.CouponPointsRuleRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.UserCouponRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private UserCouponRepository userCouponRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponPointsRuleRepository couponPointsRuleRepository;

    @Autowired
    private PointsService pointsService;

    /**
     * 获取所有可用优惠券（排除积分兑换券，避免与积分中心重复）
     */
    public List<Coupon> getAvailableCoupons() {
        return couponRepository.findAvailableCoupons(LocalDateTime.now()).stream()
                .filter(coupon -> !couponPointsRuleRepository.existsByCouponId(coupon.getId()))
                .toList();
    }

    /**
     * 获取所有可用优惠券（管理员用，含积分兑换券）
     */
    public List<Coupon> getAllAvailableCouponsWithPointsRules() {
        return couponRepository.findAvailableCoupons(LocalDateTime.now());
    }

    /**
     * 获取所有优惠券（管理员用）
     */
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    /**
     * 获取用户优惠券
     */
    public List<UserCoupon> getUserCoupons(Long userId) {
        return userCouponRepository.findByUserIdOrderByGetTimeDesc(userId);
    }

    /**
     * 获取用户可用优惠券
     */
    public List<UserCoupon> getAvailableUserCoupons(Long userId) {
        return userCouponRepository.findAvailableByUserId(userId);
    }

    /**
     * 创建优惠券（支持积分规则）
     */
    @Transactional
    public Coupon createCoupon(Coupon coupon, CouponPointsRuleRequest pointsRule) {
        if (coupon.getCode() == null || coupon.getCode().isEmpty()) {
            coupon.setCode(generateCouponCode());
        }

        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new RuntimeException("优惠券码已存在");
        }

        Coupon saved = couponRepository.save(coupon);

        if (pointsRule != null && pointsRule.getPointsCost() != null && pointsRule.getPointsCost() > 0) {
            CouponPointsRule rule = new CouponPointsRule(saved, pointsRule.getPointsCost(), pointsRule.getMaxDailyRedeem());
            couponPointsRuleRepository.save(rule);
        }

        return saved;
    }

    /**
     * 更新优惠券（支持积分规则）
     */
    @Transactional
    public Coupon updateCoupon(Long id, Coupon coupon, CouponPointsRuleRequest pointsRule) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));

        existing.setName(coupon.getName());
        existing.setType(coupon.getType());
        existing.setMinAmount(coupon.getMinAmount());
        existing.setValue(coupon.getValue());
        existing.setTotalCount(coupon.getTotalCount());
        existing.setStartTime(coupon.getStartTime());
        existing.setEndTime(coupon.getEndTime());
        existing.setStatus(coupon.getStatus());

        Coupon saved = couponRepository.save(existing);

        if (pointsRule != null && pointsRule.getPointsCost() != null && pointsRule.getPointsCost() > 0) {
            if (couponPointsRuleRepository.existsByCouponId(existing.getId())) {
                CouponPointsRule existingRule = couponPointsRuleRepository.findByCouponId(existing.getId())
                        .orElseThrow(() -> new RuntimeException("优惠券积分规则不存在"));
                existingRule.setPointsCost(pointsRule.getPointsCost());
                existingRule.setMaxDailyRedeem(pointsRule.getMaxDailyRedeem());
                couponPointsRuleRepository.save(existingRule);
            } else {
                CouponPointsRule rule = new CouponPointsRule(existing, pointsRule.getPointsCost(), pointsRule.getMaxDailyRedeem());
                couponPointsRuleRepository.save(rule);
            }
        } else if (couponPointsRuleRepository.existsByCouponId(existing.getId())) {
            couponPointsRuleRepository.deleteByCouponId(existing.getId());
        }

        return saved;
    }

    /**
     * 删除优惠券（同时删除积分规则）
     */
    @Transactional
    public void deleteCoupon(Long id) {
        if (couponPointsRuleRepository.existsByCouponId(id)) {
            couponPointsRuleRepository.deleteByCouponId(id);
        }
        couponRepository.deleteById(id);
    }

    /**
     * 领取优惠券
     */
    @Transactional
    public UserCoupon claimCoupon(Long userId, Long couponId) {
        if (userCouponRepository.existsByUserIdAndCouponId(userId, couponId)) {
            throw new RuntimeException("您已领取过该优惠券");
        }

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));

        if (!coupon.isAvailable()) {
            throw new RuntimeException("优惠券不可用");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        UserCoupon userCoupon = new UserCoupon(user, coupon);
        userCouponRepository.save(userCoupon);

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return userCoupon;
    }

    /**
     * 使用优惠券（订单应用）
     */
    @Transactional
    public BigDecimal useCoupon(Long userId, Long userCouponId, BigDecimal orderAmount, Long orderId) {
        UserCoupon userCoupon = userCouponRepository.findById(userCouponId)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));

        if (!userCoupon.getUser().getId().equals(userId)) {
            throw new RuntimeException("这不是您的优惠券");
        }

        if (!userCoupon.isAvailable()) {
            throw new RuntimeException("优惠券不可用");
        }

        BigDecimal discount = userCoupon.getCoupon().calculateDiscount(orderAmount);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("订单金额不满足优惠条件");
        }

        userCoupon.markAsUsed(orderId);
        userCouponRepository.save(userCoupon);

        return discount;
    }

    /**
     * 获取优惠券及其积分规则
     */
    public Map<String, Object> getCouponWithRule(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));

        Map<String, Object> result = new HashMap<>();
        result.put("coupon", coupon);
        couponPointsRuleRepository.findByCouponId(couponId).ifPresent(rule -> result.put("pointsRule", rule));
        return result;
    }

    /**
     * 获取可积分兑换的优惠券列表
     */
    public List<RedeemableCouponResponse> getAvailableRedeemCoupons() {
        List<Coupon> availableCoupons = couponRepository.findAvailableCoupons(LocalDateTime.now());
        List<RedeemableCouponResponse> result = new ArrayList<>();

        for (Coupon coupon : availableCoupons) {
            couponPointsRuleRepository.findByCouponId(coupon.getId()).ifPresent(rule -> {
                result.add(new RedeemableCouponResponse(
                        PublicCouponResponse.from(coupon),
                        CouponPointsRuleSummaryResponse.from(rule)));
            });
        }

        return result;
    }

    /**
     * 积分兑换优惠券
     */
    @Transactional
    public UserCoupon redeemCouponWithPoints(Long userId, Long couponId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));

        if (!coupon.isAvailable()) {
            throw new RuntimeException("优惠券不可用");
        }

        CouponPointsRule rule = couponPointsRuleRepository.findByCouponId(couponId)
                .orElseThrow(() -> new RuntimeException("该优惠券不支持积分兑换"));

        if (user.getPoints() < rule.getPointsCost()) {
            throw new RuntimeException("积分不足");
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayRedeemed = userCouponRepository.countRedeemedByUserAndCouponToday(userId, couponId, startOfDay);
        if (todayRedeemed >= rule.getMaxDailyRedeem()) {
            throw new RuntimeException("今日已达兑换上限");
        }

        pointsService.deductPoints(userId, rule.getPointsCost(), "COUPON_REDEEM", "积分兑换优惠券: " + coupon.getName());

        UserCoupon userCoupon = new UserCoupon(user, coupon);
        userCouponRepository.save(userCoupon);

        couponPointsRuleRepository.incrementTotalRedeemed(rule.getId());

        return userCoupon;
    }

    private String generateCouponCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

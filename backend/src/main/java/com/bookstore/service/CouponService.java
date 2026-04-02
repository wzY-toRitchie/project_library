package com.bookstore.service;

import com.bookstore.entity.Coupon;
import com.bookstore.entity.User;
import com.bookstore.entity.UserCoupon;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.UserCouponRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private UserCouponRepository userCouponRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 获取所有可用优惠券
     */
    public List<Coupon> getAvailableCoupons() {
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
     * 创建优惠券
     */
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        // 生成优惠券码
        if (coupon.getCode() == null || coupon.getCode().isEmpty()) {
            coupon.setCode(generateCouponCode());
        }

        // 检查优惠券码是否已存在
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new RuntimeException("优惠券码已存在");
        }

        return couponRepository.save(coupon);
    }

    /**
     * 更新优惠券
     */
    @Transactional
    public Coupon updateCoupon(Long id, Coupon coupon) {
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

        return couponRepository.save(existing);
    }

    /**
     * 删除优惠券
     */
    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    /**
     * 领取优惠券
     */
    @Transactional
    public UserCoupon claimCoupon(Long userId, Long couponId) {
        // 检查是否已领取
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

        // 创建用户优惠券
        UserCoupon userCoupon = new UserCoupon(user, coupon);
        userCouponRepository.save(userCoupon);

        // 更新优惠券使用数量
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return userCoupon;
    }

    /**
     * 使用优惠券
     */
    @Transactional
    public BigDecimal useCoupon(Long userId, Long userCouponId, BigDecimal orderAmount, Long orderId) {
        UserCoupon userCoupon = userCouponRepository.findById(userCouponId)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));

        // 检查是否是用户的优惠券
        if (!userCoupon.getUser().getId().equals(userId)) {
            throw new RuntimeException("这不是您的优惠券");
        }

        if (!userCoupon.isAvailable()) {
            throw new RuntimeException("优惠券不可用");
        }

        // 计算优惠金额
        BigDecimal discount = userCoupon.getCoupon().calculateDiscount(orderAmount);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("订单金额不满足优惠条件");
        }

        // 标记为已使用
        userCoupon.markAsUsed(orderId);
        userCouponRepository.save(userCoupon);

        return discount;
    }

    /**
     * 生成优惠券码
     */
    private String generateCouponCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

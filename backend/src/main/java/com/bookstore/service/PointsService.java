package com.bookstore.service;

import com.bookstore.entity.PointsHistory;
import com.bookstore.entity.User;
import com.bookstore.repository.PointsHistoryRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class PointsService {

    @Autowired
    private PointsHistoryRepository pointsHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    // 积分规则常量
    public static final int REGISTER_POINTS = 100;
    public static final int REVIEW_POINTS = 10;
    public static final int SIGN_IN_POINTS = 5;
    public static final double PURCHASE_RATE = 0.1; // 1元 = 0.1积分
    public static final int DEDUCT_RATE = 10; // 10积分 = 1元

    /**
     * 获取用户积分余额
     */
    public Integer getUserPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return user.getPoints();
    }

    /**
     * 获取用户积分历史
     */
    public List<PointsHistory> getUserPointsHistory(Long userId) {
        return pointsHistoryRepository.findByUserIdOrderByCreateTimeDesc(userId);
    }

    /**
     * 添加积分（通用方法）
     */
    @Transactional
    public PointsHistory addPoints(Long userId, Integer points, String type, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 更新用户积分
        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

        // 记录积分历史
        PointsHistory history = new PointsHistory(user, points, type, description);
        return pointsHistoryRepository.save(history);
    }

    /**
     * 添加积分（带订单ID）
     */
    @Transactional
    public PointsHistory addPoints(Long userId, Integer points, String type, String description, Long orderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 更新用户积分
        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

        // 记录积分历史
        PointsHistory history = new PointsHistory(user, points, type, description, orderId);
        return pointsHistoryRepository.save(history);
    }

    /**
     * 扣减积分
     */
    @Transactional
    public PointsHistory deductPoints(Long userId, Integer points, String type, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (user.getPoints() < points) {
            throw new RuntimeException("积分不足");
        }

        // 更新用户积分
        user.setPoints(user.getPoints() - points);
        userRepository.save(user);

        // 记录积分历史（负数表示消耗）
        PointsHistory history = new PointsHistory(user, -points, type, description);
        return pointsHistoryRepository.save(history);
    }

    /**
     * 注册奖励积分
     */
    @Transactional
    public PointsHistory addRegisterPoints(Long userId) {
        return addPoints(userId, REGISTER_POINTS, "REGISTER", "注册奖励");
    }

    /**
     * 购买获得积分
     */
    @Transactional
    public PointsHistory addPurchasePoints(Long userId, BigDecimal orderAmount, Long orderId) {
        int points = orderAmount.multiply(BigDecimal.valueOf(PURCHASE_RATE))
                .setScale(0, RoundingMode.FLOOR)
                .intValue();
        if (points <= 0) {
            return null;
        }
        return addPoints(userId, points, "PURCHASE", "消费返积分", orderId);
    }

    /**
     * 评价获得积分
     */
    @Transactional
    public PointsHistory addReviewPoints(Long userId) {
        return addPoints(userId, REVIEW_POINTS, "REVIEW", "评价奖励");
    }

    /**
     * 每日签到积分
     */
    @Transactional
    public PointsHistory signIn(Long userId) {
        // 检查今天是否已签到
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        if (pointsHistoryRepository.hasSignedInToday(userId, startOfDay)) {
            throw new RuntimeException("今天已经签到过了");
        }

        return addPoints(userId, SIGN_IN_POINTS, "SIGN_IN", "每日签到");
    }

    /**
     * 积分抵扣
     */
    @Transactional
    public PointsHistory deductPointsForOrder(Long userId, Integer points, Long orderId) {
        return deductPoints(userId, points, "DEDUCT", "积分抵扣");
    }

    /**
     * 计算积分可抵扣金额
     */
    public BigDecimal calculateDeductAmount(Integer points) {
        return BigDecimal.valueOf(points).divide(BigDecimal.valueOf(DEDUCT_RATE), 2, RoundingMode.FLOOR);
    }

    /**
     * 检查用户今天是否已签到
     */
    public boolean hasSignedInToday(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return pointsHistoryRepository.hasSignedInToday(userId, startOfDay);
    }
}

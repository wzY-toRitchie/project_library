package com.bookstore.service;

import com.bookstore.entity.PointsHistory;
import com.bookstore.entity.PointsRuleSetting;
import com.bookstore.entity.User;
import com.bookstore.payload.response.PointsRuleResponse;
import com.bookstore.repository.PointsHistoryRepository;
import com.bookstore.repository.PointsRuleSettingRepository;
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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PointsService {

    @Autowired
    private PointsHistoryRepository pointsHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointsRuleSettingRepository pointsRuleSettingRepository;

    // 内存缓存，避免每次查询数据库
    private final Map<String, Integer> rulesCache = new ConcurrentHashMap<>();

    /**
     * 获取积分规则值（从数据库读取，带内存缓存）
     */
    private int getRuleValue(String ruleKey, int defaultValue) {
        return rulesCache.computeIfAbsent(ruleKey, key ->
                pointsRuleSettingRepository.findByRuleKey(key)
                        .map(PointsRuleSetting::getRuleValue)
                        .orElse(defaultValue)
        );
    }

    /**
     * 清除指定规则的缓存
     */
    public void invalidateRuleCache(String ruleKey) {
        rulesCache.remove(ruleKey);
    }

    /**
     * 重新加载所有规则到缓存
     */
    public void reloadRules() {
        rulesCache.clear();
        List<PointsRuleSetting> settings = pointsRuleSettingRepository.findAll();
        for (PointsRuleSetting s : settings) {
            rulesCache.put(s.getRuleKey(), s.getRuleValue());
        }
    }

    /**
     * 获取用户积分余额
     */
    public Integer getUserPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getPoints() == null) {
            user.setPoints(0);
            userRepository.save(user);
        }
        return user.getPoints();
    }

    /**
     * 获取用户积分历史
     */
    public List<PointsHistory> getUserPointsHistory(Long userId) {
        return pointsHistoryRepository.findByUserIdOrderByCreateTimeDesc(userId);
    }

    // 默认规则值（当数据库为空时使用）
    public static final int DEFAULT_REGISTER_POINTS = 100;
    public static final int DEFAULT_REVIEW_POINTS = 10;
    public static final int DEFAULT_SIGN_IN_POINTS = 5;
    public static final double DEFAULT_PURCHASE_RATE = 0.1;
    public static final int DEFAULT_DEDUCT_RATE = 10;

    /**
     * 添加积分（通用方法）
     */
    @Transactional
    public PointsHistory addPoints(Long userId, Integer points, String type, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

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

        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

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

        if (user.getPoints() == null) user.setPoints(0);
        if (user.getPoints() < points) {
            throw new RuntimeException("积分不足");
        }

        user.setPoints(user.getPoints() - points);
        userRepository.save(user);

        PointsHistory history = new PointsHistory(user, -points, type, description);
        return pointsHistoryRepository.save(history);
    }

    /**
     * 注册奖励积分
     */
    @Transactional
    public PointsHistory addRegisterPoints(Long userId) {
        int points = getRuleValue("REGISTER_POINTS", DEFAULT_REGISTER_POINTS);
        return addPoints(userId, points, "REGISTER", "注册奖励");
    }

    /**
     * 购买获得积分
     */
    @Transactional
    public PointsHistory addPurchasePoints(Long userId, BigDecimal orderAmount, Long orderId) {
        int purchaseRate = getRuleValue("PURCHASE_RATE", (int) (DEFAULT_PURCHASE_RATE * 100));
        double rate = purchaseRate / 100.0;
        int points = orderAmount.multiply(BigDecimal.valueOf(rate))
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
        int points = getRuleValue("REVIEW_POINTS", DEFAULT_REVIEW_POINTS);
        return addPoints(userId, points, "REVIEW", "评价奖励");
    }

    /**
     * 每日签到积分
     */
    @Transactional
    public PointsHistory signIn(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        if (pointsHistoryRepository.hasSignedInToday(userId, startOfDay)) {
            throw new RuntimeException("今天已经签到过了");
        }
        int points = getRuleValue("SIGN_IN_POINTS", DEFAULT_SIGN_IN_POINTS);
        return addPoints(userId, points, "SIGN_IN", "每日签到");
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
        int deductRate = getRuleValue("DEDUCT_RATE", DEFAULT_DEDUCT_RATE);
        return BigDecimal.valueOf(points).divide(BigDecimal.valueOf(deductRate), 2, RoundingMode.FLOOR);
    }

    /**
     * 检查用户今天是否已签到
     */
    public boolean hasSignedInToday(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return pointsHistoryRepository.hasSignedInToday(userId, startOfDay);
    }

    /**
     * 获取所有积分规则（管理员用）
     */
    public List<PointsRuleResponse> getRuleSettings() {
        List<PointsRuleSetting> settings = pointsRuleSettingRepository.findAll();
        return settings.stream().map(s -> new PointsRuleResponse(
                s.getRuleKey(),
                s.getRuleValue(),
                s.getDescription(),
                s.getUpdateTime(),
                s.getUpdater()
        )).toList();
    }

    /**
     * 更新积分规则（管理员用）
     */
    @Transactional
    public PointsRuleResponse updateRuleSetting(String ruleKey, Integer newValue, String updater) {
        PointsRuleSetting setting = pointsRuleSettingRepository.findByRuleKey(ruleKey)
                .orElseThrow(() -> new RuntimeException("积分规则不存在: " + ruleKey));

        setting.setRuleValue(newValue);
        setting.setUpdater(updater);
        pointsRuleSettingRepository.save(setting);

        // 清除缓存
        rulesCache.remove(ruleKey);

        return new PointsRuleResponse(
                setting.getRuleKey(),
                setting.getRuleValue(),
                setting.getDescription(),
                setting.getUpdateTime(),
                setting.getUpdater()
        );
    }

    /**
     * 管理员手动调整用户积分
     */
    @Transactional
    public PointsHistory adjustUserPoints(Long userId, Integer points, String reason, String operator) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (user.getPoints() == null) user.setPoints(0);
        // 检查扣分后积分不能为负
        if (user.getPoints() + points < 0) {
            throw new RuntimeException("积分不足，无法扣减至负数");
        }

        user.setPoints(user.getPoints() + points);
        userRepository.save(user);

        String type = points > 0 ? "ADMIN_ADD" : "ADMIN_DEDUCT";
        String description = points > 0 ? reason : "管理员扣减积分";
        PointsHistory history = new PointsHistory(user, points, type, description);
        return pointsHistoryRepository.save(history);
    }
}

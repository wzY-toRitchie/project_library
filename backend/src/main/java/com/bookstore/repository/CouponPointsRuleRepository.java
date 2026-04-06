package com.bookstore.repository;

import com.bookstore.entity.CouponPointsRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface CouponPointsRuleRepository extends JpaRepository<CouponPointsRule, Long> {
    Optional<CouponPointsRule> findByCouponId(Long couponId);

    boolean existsByCouponId(Long couponId);

    @Transactional
    void deleteByCouponId(Long couponId);

    @Modifying
    @Transactional
    @Query("UPDATE CouponPointsRule c SET c.totalRedeemed = c.totalRedeemed + 1 WHERE c.id = :id")
    int incrementTotalRedeemed(@Param("id") Long id);
}

package com.bookstore.repository;

import com.bookstore.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    List<UserCoupon> findByUserIdOrderByGetTimeDesc(Long userId);

    List<UserCoupon> findByUserIdAndStatus(Long userId, String status);

    Optional<UserCoupon> findByUserIdAndCouponId(Long userId, Long couponId);

    boolean existsByUserIdAndCouponId(Long userId, Long couponId);

    @Query("SELECT uc FROM UserCoupon uc WHERE uc.user.id = :userId AND uc.status = 'UNUSED' AND uc.coupon.status = 'ACTIVE' AND uc.coupon.endTime >= CURRENT_TIMESTAMP")
    List<UserCoupon> findAvailableByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    @Query("SELECT COUNT(uc) FROM UserCoupon uc WHERE uc.user.id = :userId AND uc.coupon.id = :couponId AND uc.getTime >= :startOfDay")
    long countRedeemedByUserAndCouponToday(@Param("userId") Long userId, @Param("couponId") Long couponId, @Param("startOfDay") LocalDateTime startOfDay);
}

package com.bookstore.repository;

import com.bookstore.entity.PointsHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PointsHistoryRepository extends JpaRepository<PointsHistory, Long> {

    // 查找用户的积分历史（按时间倒序）
    List<PointsHistory> findByUserIdOrderByCreateTimeDesc(Long userId);

    // 查找用户的最近N条积分历史
    List<PointsHistory> findTop10ByUserIdOrderByCreateTimeDesc(Long userId);

    // 检查用户今天是否已签到
    @Query("SELECT COUNT(h) > 0 FROM PointsHistory h WHERE h.user.id = :userId AND h.type = 'SIGN_IN' AND h.createTime >= :startOfDay")
    boolean hasSignedInToday(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay);

    // 统计用户获得的总积分
    @Query("SELECT COALESCE(SUM(h.points), 0) FROM PointsHistory h WHERE h.user.id = :userId AND h.points > 0")
    Integer sumEarnedByUserId(@Param("userId") Long userId);

    // 统计用户消耗的总积分
    @Query("SELECT COALESCE(SUM(ABS(h.points)), 0) FROM PointsHistory h WHERE h.user.id = :userId AND h.points < 0")
    Integer sumSpentByUserId(@Param("userId") Long userId);
}

package com.bookstore.repository;

import com.bookstore.entity.BrowsingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrowsingHistoryRepository extends JpaRepository<BrowsingHistory, Long> {

    // 查找用户的浏览历史（按最后浏览时间倒序）
    List<BrowsingHistory> findByUserIdOrderByLastViewTimeDesc(Long userId);

    // 查找用户的最近N条浏览历史
    List<BrowsingHistory> findTop10ByUserIdOrderByLastViewTimeDesc(Long userId);

    // 查找用户对某本图书的浏览记录
    Optional<BrowsingHistory> findByUserIdAndBookId(Long userId, Long bookId);

    // 检查用户是否浏览过某本图书
    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    // 删除用户的某本图书浏览记录
    @Modifying
    @Transactional
    void deleteByUserIdAndBookId(Long userId, Long bookId);

    // 删除用户的所有浏览历史
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    // 统计用户的浏览历史数量
    long countByUserId(Long userId);

    // 统计某本图书被浏览的次数
    @Query("SELECT SUM(h.viewCount) FROM BrowsingHistory h WHERE h.book.id = :bookId")
    Long sumViewCountByBookId(@Param("bookId") Long bookId);

    // 获取用户最近浏览的图书ID列表
    @Query("SELECT h.book.id FROM BrowsingHistory h WHERE h.user.id = :userId ORDER BY h.lastViewTime DESC")
    List<Long> findRecentBookIdsByUserId(@Param("userId") Long userId);
}

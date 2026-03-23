package com.bookstore.repository;

import com.bookstore.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // 查找用户的收藏列表
    List<Favorite> findByUserIdOrderByCreateTimeDesc(Long userId);

    // 查找用户是否收藏了某本图书
    Optional<Favorite> findByUserIdAndBookId(Long userId, Long bookId);

    // 检查用户是否收藏了某本图书
    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    // 删除用户的某本图书收藏
    @Modifying
    @Transactional
    void deleteByUserIdAndBookId(Long userId, Long bookId);

    // 删除用户的所有收藏
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    // 统计用户的收藏数量
    long countByUserId(Long userId);

    // 统计某本图书被收藏的次数
    long countByBookId(Long bookId);
}

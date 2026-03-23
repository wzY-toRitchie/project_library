package com.bookstore.repository;

import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);
    
    // 获取每日用户注册数据
    @Query("SELECT DATE(u.createTime), COUNT(u) FROM User u WHERE u.createTime >= :start AND u.createTime < :end GROUP BY DATE(u.createTime) ORDER BY DATE(u.createTime)")
    List<Object[]> getDailyRegistrations(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

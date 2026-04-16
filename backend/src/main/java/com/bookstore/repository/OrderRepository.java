package com.bookstore.repository;

import com.bookstore.entity.Order;
import com.bookstore.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("""
            SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END
            FROM Order o
            JOIN o.items oi
            WHERE o.user.id = :userId
              AND oi.book.id = :bookId
              AND o.status = com.bookstore.enums.OrderStatus.COMPLETED
            """)
    boolean existsCompletedOrderByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);
    
    // 统计时间范围内的订单数
    long countByCreateTimeBetween(LocalDateTime start, LocalDateTime end);
    
    // 统计总销售额（排除已取消订单）
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.status != com.bookstore.enums.OrderStatus.CANCELLED")
    BigDecimal sumTotalSales();
    
    // 统计时间范围内的销售额
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.createTime >= :start AND o.createTime < :end AND o.status != com.bookstore.enums.OrderStatus.CANCELLED")
    BigDecimal sumSalesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // 获取每日销售数据
    @Query("SELECT DATE(o.createTime), SUM(o.totalPrice) FROM Order o WHERE o.createTime >= :start AND o.createTime < :end AND o.status != com.bookstore.enums.OrderStatus.CANCELLED GROUP BY DATE(o.createTime) ORDER BY DATE(o.createTime)")
    List<Object[]> getDailySales(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // 获取订单状态分布
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrderStatusDistribution();
    
    // 获取热销商品
    @Query("SELECT oi.book, SUM(oi.quantity) as total FROM OrderItem oi GROUP BY oi.book ORDER BY total DESC")
    List<Object[]> getTopProducts(Pageable pageable);
    
    // 获取分类销售数据
    @Query("SELECT oi.book.category.name, SUM(oi.quantity) FROM OrderItem oi GROUP BY oi.book.category.name")
    List<Object[]> getCategorySales();
    
    // 统计指定状态的订单数
    long countByStatus(OrderStatus status);
}

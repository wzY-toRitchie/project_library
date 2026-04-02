package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByCategoryId(Long categoryId);
    List<Book> findByCategoryId(Long categoryId, Sort sort);
    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByFeaturedTrue(Pageable pageable);
    boolean existsByCategoryId(Long categoryId);
    
    // 多字段搜索：书名、作者、描述
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // 多字段搜索 + 分类筛选
    @Query("SELECT b FROM Book b WHERE b.category.id = :categoryId AND (" +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> searchByKeywordAndCategory(@Param("keyword") String keyword, @Param("categoryId") Long categoryId, Pageable pageable);
    
    // 获取热门搜索词（基于销量）
    @Query("SELECT b.title FROM OrderItem oi JOIN oi.book b GROUP BY b ORDER BY SUM(oi.quantity) DESC")
    List<String> findTopSellingBookTitles(Pageable pageable);
    
    // 统计库存低于阈值的商品数
    @Query("SELECT COUNT(b) FROM Book b WHERE b.stock <= :threshold")
    Long countLowStockBooks(@Param("threshold") int threshold);
    
    // 原子扣减库存（防止并发超卖）
    @Modifying
    @Transactional
    @Query("UPDATE Book b SET b.stock = b.stock - :quantity WHERE b.id = :id AND b.stock >= :quantity")
    int decreaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);
    
    // 原子恢复库存
    @Modifying
    @Transactional
    @Query("UPDATE Book b SET b.stock = b.stock + :quantity WHERE b.id = :id")
    int increaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);
}

package com.bookstore.repository;

import com.bookstore.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookId(Long bookId);
    List<Review> findByUserId(Long userId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    @Query("""
            SELECT
                COALESCE(AVG(r.rating), 0),
                COUNT(r)
            FROM Review r
            WHERE r.book.id = :bookId
            """)
    BookRatingStats findBookRatingStatsByBookId(@Param("bookId") Long bookId);

    interface BookRatingStats {
        Double getAverageRating();
        Long getReviewCount();
    }
}

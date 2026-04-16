package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Review addReview(@NonNull Review review) {
        Review savedReview = reviewRepository.save(review);
        if (review.getBook() != null) {
            Long bookId = review.getBook().getId();
            if (bookId != null) {
                updateBookRating(bookId);
            }
        }
        return savedReview;
    }

    public List<Review> getReviewsByBookId(@NonNull Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    public List<Review> getReviewsByUserId(@NonNull Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public boolean hasUserPurchasedBook(@NonNull Long userId, @NonNull Long bookId) {
        return orderRepository.existsCompletedOrderByUserIdAndBookId(userId, bookId);
    }

    public boolean hasUserReviewedBook(@NonNull Long userId, @NonNull Long bookId) {
        return reviewRepository.existsByUserIdAndBookId(userId, bookId);
    }

    /**
     * 获取所有评价（管理员）
     */
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    /**
     * 删除评价
     */
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            reviewRepository.deleteById(id);
            if (review.getBook() != null) {
                updateBookRating(review.getBook().getId());
            }
        }
    }

    private void updateBookRating(@NonNull Long bookId) {
        ReviewRepository.BookRatingStats stats = reviewRepository.findBookRatingStatsByBookId(bookId);
        double average = stats != null && stats.getReviewCount() != null && stats.getReviewCount() > 0
                ? (stats.getAverageRating() == null ? 0.0 : stats.getAverageRating())
                : 0.0;

        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null) {
            book.setRating(Math.round(average * 10.0) / 10.0);
            bookRepository.save(book);
        }
    }
}

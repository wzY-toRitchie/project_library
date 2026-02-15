package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

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

    private void updateBookRating(@NonNull Long bookId) {
        List<Review> reviews = reviewRepository.findByBookId(bookId);
        if (reviews.isEmpty())
            return;

        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(5.0);

        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null) {
            book.setRating(Math.round(average * 10.0) / 10.0);
            bookRepository.save(book);
        }
    }
}

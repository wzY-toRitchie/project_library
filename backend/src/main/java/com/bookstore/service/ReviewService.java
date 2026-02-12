package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

    public Review addReview(Review review) {
        Review savedReview = reviewRepository.save(review);
        updateBookRating(review.getBook().getId());
        return savedReview;
    }

    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    private void updateBookRating(Long bookId) {
        List<Review> reviews = reviewRepository.findByBookId(bookId);
        if (reviews.isEmpty()) return;

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

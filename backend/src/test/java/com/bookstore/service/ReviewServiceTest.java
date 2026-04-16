package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void hasUserPurchasedBookDelegatesToCompletedOrderCheck() {
        when(orderRepository.existsCompletedOrderByUserIdAndBookId(2L, 9L)).thenReturn(true);

        assertThat(reviewService.hasUserPurchasedBook(2L, 9L)).isTrue();
    }

    @Test
    void hasUserReviewedBookDelegatesToReviewExistenceCheck() {
        when(reviewRepository.existsByUserIdAndBookId(2L, 9L)).thenReturn(true);

        assertThat(reviewService.hasUserReviewedBook(2L, 9L)).isTrue();
    }

    @Test
    void deleteReviewResetsBookRatingWhenLastReviewIsRemoved() {
        Book book = new Book();
        book.setId(7L);
        book.setRating(4.8);

        Review review = new Review();
        review.setId(1L);
        review.setBook(book);
        review.setRating(5);

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(bookRepository.findById(7L)).thenReturn(Optional.of(book));
        when(reviewRepository.findBookRatingStatsByBookId(7L)).thenReturn(bookRatingStats(0.0, 0L));

        reviewService.deleteReview(1L);

        assertThat(book.getRating()).isEqualTo(0.0);
        verify(reviewRepository).deleteById(1L);
        verify(bookRepository).save(book);
    }

    @Test
    void addReviewRecalculatesBookRatingFromAggregatedStats() {
        Book book = new Book();
        book.setId(7L);

        Review newReview = new Review();
        newReview.setBook(book);
        newReview.setRating(5);

        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookRepository.findById(7L)).thenReturn(Optional.of(book));
        when(reviewRepository.findBookRatingStatsByBookId(7L)).thenReturn(bookRatingStats(4.5, 2L));

        Review saved = reviewService.addReview(newReview);

        assertThat(saved).isSameAs(newReview);
        assertThat(book.getRating()).isEqualTo(4.5);
        verify(bookRepository).save(book);
    }

    private ReviewRepository.BookRatingStats bookRatingStats(Double averageRating, Long reviewCount) {
        return new ReviewRepository.BookRatingStats() {
            @Override
            public Double getAverageRating() {
                return averageRating;
            }

            @Override
            public Long getReviewCount() {
                return reviewCount;
            }
        };
    }
}

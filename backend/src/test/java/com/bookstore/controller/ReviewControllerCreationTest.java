package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.payload.request.ReviewRequest;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.ReviewService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerCreationTest {

    @Mock
    private ReviewService reviewService;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewController reviewController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createReviewUsesAuthenticatedUserInsteadOfClientSuppliedUserId() {
        authenticate(7L, "USER");
        User user = new User();
        user.setId(7L);
        Book book = new Book();
        book.setId(10L);
        ReviewRequest request = reviewRequest(10L);

        when(reviewService.hasUserPurchasedBook(7L, 10L)).thenReturn(true);
        when(reviewService.hasUserReviewedBook(7L, 10L)).thenReturn(false);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(reviewService.addReview(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> response = reviewController.createReview(request);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewService).addReview(captor.capture());
        Review saved = captor.getValue();
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getBook()).isSameAs(book);
        assertThat(saved.getRating()).isEqualTo(5);
        assertThat(saved.getComment()).isEqualTo("great book");
        assertThat(response).containsEntry("message", "评价提交成功");
    }

    private ReviewRequest reviewRequest(Long bookId) {
        ReviewRequest request = new ReviewRequest();
        request.setBookId(bookId);
        request.setRating(5);
        request.setComment("great book");
        return request;
    }

    private void authenticate(Long userId, String role) {
        User user = new User();
        user.setId(userId);
        user.setUsername("user" + userId);
        user.setPassword("secret");
        user.setEmail("user" + userId + "@example.com");
        user.setRole(role);

        UserDetailsImpl principal = UserDetailsImpl.build(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }
}

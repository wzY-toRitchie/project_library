package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.payload.request.ReviewRequest;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.ReviewService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerAuthorizationTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createReviewRejectsWhenBookNotPurchased() {
        authenticate(1L, "USER");
        when(reviewService.hasUserPurchasedBook(1L, 10L)).thenReturn(false);

        assertThatThrownBy(() -> reviewController.createReview(reviewRequest(10L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("仅已完成订单的用户可评价该图书");
        verify(reviewService, never()).addReview(any());
    }

    @Test
    void createReviewRejectsDuplicateSubmission() {
        authenticate(1L, "USER");
        when(reviewService.hasUserPurchasedBook(1L, 10L)).thenReturn(true);
        when(reviewService.hasUserReviewedBook(1L, 10L)).thenReturn(true);

        assertThatThrownBy(() -> reviewController.createReview(reviewRequest(10L)))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("该图书已评价，请勿重复提交");
        verify(reviewService, never()).addReview(any());
    }

    @Test
    void getReviewsByUserRejectsOtherNonAdminUser() {
        authenticate(1L, "USER");

        assertThatThrownBy(() -> reviewController.getReviewsByUser(2L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("无权查看其他用户的评价");
        verify(reviewService, never()).getReviewsByUserId(2L);
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

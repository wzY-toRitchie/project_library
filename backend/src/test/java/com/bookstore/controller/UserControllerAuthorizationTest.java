package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.payload.response.UserSummaryResponse;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerAuthorizationTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getUserByIdRejectsOtherNonAdminUser() {
        authenticate(1L, "USER");

        assertThatThrownBy(() -> userController.getUserById(2L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("无权查看其他用户信息");
        verify(userService, never()).getUserSummary(2L);
    }

    @Test
    void getUserByIdReturnsCurrentUserSummary() {
        authenticate(1L, "USER");
        UserSummaryResponse summary = new UserSummaryResponse(
                1L,
                "user1",
                "user1@example.com",
                "User One",
                "13800138000",
                "Shanghai",
                "USER",
                LocalDateTime.now(),
                1L);
        when(userService.getUserSummary(1L)).thenReturn(Optional.of(summary));

        ResponseEntity<UserSummaryResponse> response = userController.getUserById(1L);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(summary);
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

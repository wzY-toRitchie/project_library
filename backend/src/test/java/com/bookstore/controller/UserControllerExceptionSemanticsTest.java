package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.UpdatePasswordRequest;
import com.bookstore.payload.request.UpdateProfileRequest;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerExceptionSemanticsTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateUserRoleRejectsNonAdminUser() {
        authenticate(1L, "USER");

        assertThatThrownBy(() -> userController.updateUserRole(10L, "ADMIN"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("无权修改用户角色");
    }

    @Test
    void updateUserRolePropagatesResourceNotFoundException() {
        authenticate(99L, "ADMIN");
        when(userService.updateRole(10L, "ADMIN")).thenThrow(new ResourceNotFoundException("User not found"));

        assertThatThrownBy(() -> userController.updateUserRole(10L, "ADMIN"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void updateProfilePropagatesBadRequestException() {
        authenticate(1L, "USER");
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("user1");
        request.setEmail("taken@example.com");

        when(userService.updateProfile(1L, request)).thenThrow(new BadRequestException("Email already in use"));

        assertThatThrownBy(() -> userController.updateProfile(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already in use");
    }

    @Test
    void updateUserByAdminPropagatesResourceNotFoundException() {
        authenticate(99L, "ADMIN");
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("target");
        request.setEmail("target@example.com");

        when(userService.updateUserByAdmin(10L, request)).thenThrow(new ResourceNotFoundException("User not found"));

        assertThatThrownBy(() -> userController.updateUserByAdmin(10L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void updatePasswordPropagatesBadRequestException() {
        authenticate(1L, "USER");
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("wrong-password");
        request.setNewPassword("new-password-123");

        doThrow(new BadRequestException("Current password is incorrect"))
                .when(userService).updatePassword(1L, request);

        assertThatThrownBy(() -> userController.updatePassword(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Current password is incorrect");
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

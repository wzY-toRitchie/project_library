package com.bookstore.service;

import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.UpdatePasswordRequest;
import com.bookstore.payload.request.UpdateProfileRequest;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceExceptionSemanticsTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void updateRoleThrowsResourceNotFoundWhenUserMissing() {
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateRole(10L, "ADMIN"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void updateProfileThrowsBadRequestWhenEmailAlreadyUsed() {
        User user = user(1L);
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername(user.getUsername());
        request.setEmail("taken@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateProfile(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already in use");
        verify(userRepository, never()).save(user);
    }

    @Test
    void updateUserByAdminThrowsBadRequestWhenUsernameAlreadyExists() {
        User user = user(1L);
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("taken");
        request.setEmail(user.getEmail());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUserByAdmin(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Username already exists");
        verify(userRepository, never()).save(user);
    }

    @Test
    void updatePasswordThrowsBadRequestWhenCurrentPasswordIncorrect() {
        User user = user(1L);
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("wrong-password");
        request.setNewPassword("new-password-123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", user.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> userService.updatePassword(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Current password is incorrect");
        verify(userRepository, never()).save(user);
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("user" + id);
        user.setEmail("user" + id + "@example.com");
        user.setPassword("encoded-password");
        user.setRole("USER");
        return user;
    }
}

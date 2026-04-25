package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.payload.request.LoginRequest;
import com.bookstore.payload.response.JwtResponse;
import com.bookstore.payload.response.MessageResponse;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.LoginAttemptService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private LoginAttemptService loginAttemptService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    @Test
    void authenticateUserReturnsGenericMessageWhenBlocked() {
        LoginRequest request = loginRequest("blocked-user", "Password123");
        when(loginAttemptService.isBlocked("blocked-user")).thenReturn(true);

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(((MessageResponse) response.getBody()).getMessage()).isEqualTo("用户名或密码错误");
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void authenticateUserReturnsGenericMessageWhenBadCredentials() {
        LoginRequest request = loginRequest("user1", "bad-password");
        when(loginAttemptService.isBlocked("user1")).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(((MessageResponse) response.getBody()).getMessage()).isEqualTo("用户名或密码错误");
        verify(loginAttemptService).loginFailed("user1");
    }

    @Test
    void authenticateUserReturnsGenericMessageWhenUserMissing() {
        LoginRequest request = loginRequest("ghost", "Password123");
        when(loginAttemptService.isBlocked("ghost")).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.core.userdetails.UsernameNotFoundException("missing"));

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(((MessageResponse) response.getBody()).getMessage()).isEqualTo("用户名或密码错误");
        verify(loginAttemptService, never()).loginFailed("ghost");
    }

    @Test
    void authenticateUserResetsAttemptsAfterSuccess() {
        LoginRequest request = loginRequest("user1", "Password123");
        UserDetailsImpl userDetails = principal(1L, "user1");

        when(loginAttemptService.isBlocked("user1")).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");

        ResponseEntity<?> response = authController.authenticateUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isInstanceOf(JwtResponse.class);
        verify(loginAttemptService).loginSucceeded("user1");
    }

    private LoginRequest loginRequest(String username, String password) {
        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);
        return request;
    }

    private UserDetailsImpl principal(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPassword("encoded");
        user.setRole("USER");
        return new UserDetailsImpl(id, username, user.getEmail(), user.getPassword(), null, null, null, null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }
}

package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.payload.request.LoginRequest;
import com.bookstore.payload.request.SignupRequest;
import com.bookstore.payload.response.JwtResponse;
import com.bookstore.payload.response.MessageResponse;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.LoginAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "认证", description = "用户注册和登录接口")
public class AuthController {
  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @Autowired
  LoginAttemptService loginAttemptService;

  @Operation(summary = "用户登录", description = "使用用户名和密码登录，返回 JWT Token")
  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    String username = loginRequest.getUsername();
    
    // 检查是否被锁定
    if (loginAttemptService.isBlocked(username)) {
      long remainingMinutes = loginAttemptService.getRemainingLockTime(username);
      return ResponseEntity.badRequest()
          .body(new MessageResponse("账户已被锁定，请在 " + remainingMinutes + " 分钟后重试"));
    }
    
    try {
      logger.info("Login attempt for user: {}", username);
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());
      
      // 登录成功，重置失败次数
      loginAttemptService.loginSucceeded(username);
      logger.info("Login successful for user: {}", username);

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getUsername(),
          userDetails.getEmail(),
          userDetails.getFullName(),
          userDetails.getPhoneNumber(),
          userDetails.getAddress(),
          roles));
    } catch (org.springframework.security.authentication.BadCredentialsException e) {
      // 密码错误 - 记录失败次数
      loginAttemptService.loginFailed(username);
      int remainingAttempts = loginAttemptService.getRemainingAttempts(username);
      logger.warn("Bad credentials for user: {}", username);
      return ResponseEntity.badRequest()
          .body(new MessageResponse("用户名或密码错误，还剩 " + remainingAttempts + " 次尝试机会"));
    } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
      // 用户不存在 - 不记录失败次数（防止用户名枚举攻击）
      logger.warn("User not found: {}", username);
      return ResponseEntity.badRequest()
          .body(new MessageResponse("用户名或密码错误"));
    } catch (Exception e) {
      // 未知异常 - 不记录失败次数，返回通用错误信息
      logger.error("Login error for user: {}, exception: {}", username, e.getMessage(), e);
      return ResponseEntity.status(500)
          .body(new MessageResponse("登录服务异常，请稍后重试"));
    }
  }

  @Operation(summary = "用户注册", description = "注册新用户，需要用户名、邮箱和密码")
  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("该账号已被注册"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("该账号已被注册"));
    }

    // 密码强度验证
    String password = signUpRequest.getPassword();
    if (password.length() < 8) {
      return ResponseEntity.badRequest()
          .body(new MessageResponse("密码长度至少8位"));
    }
    if (!password.matches(".*[A-Z].*")) {
      return ResponseEntity.badRequest()
          .body(new MessageResponse("密码必须包含至少一个大写字母"));
    }
    if (!password.matches(".*[a-z].*")) {
      return ResponseEntity.badRequest()
          .body(new MessageResponse("密码必须包含至少一个小写字母"));
    }
    if (!password.matches(".*[0-9].*")) {
      return ResponseEntity.badRequest()
          .body(new MessageResponse("密码必须包含至少一个数字"));
    }

    // Create new user's account
    User user = new User();
    user.setUsername(signUpRequest.getUsername());
    user.setEmail(signUpRequest.getEmail());
    user.setPassword(encoder.encode(signUpRequest.getPassword()));
    user.setRole("USER"); // Default role

    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }
}

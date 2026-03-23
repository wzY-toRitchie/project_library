package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.payload.request.UpdatePasswordRequest;
import com.bookstore.payload.request.UpdateProfileRequest;
import com.bookstore.payload.response.MessageResponse;
import com.bookstore.payload.response.UserSummaryResponse;
import com.bookstore.security.SecurityUtils;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryResponse> getUserById(@PathVariable @NonNull Long id) {
        return userService.getUserSummary(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<UserSummaryResponse> getAllUsers() {
        return userService.getAllUserSummaries();
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable @NonNull Long id, @RequestParam @NonNull String role) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(403).build();
        }
        try {
            return ResponseEntity.ok(userService.updateRole(id, role));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable @NonNull Long id) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(403).body(new MessageResponse("只有管理员可以删除用户"));
        }
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            Long userId = userDetails.getId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            return userService.getUserSummary(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        return ResponseEntity.status(401).build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody @NonNull UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User updatedUser = userService.updateProfile(userId, request);
            UserSummaryResponse summary = userService.getUserSummary(updatedUser.getId()).orElse(null);
            return ResponseEntity.ok(summary != null ? summary : updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull UpdateProfileRequest request) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(403).body(new MessageResponse("只有管理员可以编辑用户资料"));
        }
        try {
            User updatedUser = userService.updateUserByAdmin(id, request);
            UserSummaryResponse summary = userService.getUserSummary(updatedUser.getId()).orElse(null);
            return ResponseEntity.ok(summary != null ? summary : updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody @NonNull UpdatePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            userService.updatePassword(userId, request);
            return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

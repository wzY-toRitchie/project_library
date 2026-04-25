package com.bookstore.controller;

import com.bookstore.entity.User;
import com.bookstore.exception.ForbiddenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "用户", description = "用户信息和账户管理接口")
public class UserController {
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_AVATAR_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    @Autowired
    private UserService userService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/{id}")
    @Operation(summary = "获取用户信息", description = "根据 ID 获取用户摘要信息")
    public ResponseEntity<UserSummaryResponse> getUserById(@PathVariable @NonNull Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();
        if (!id.equals(currentUserId) && !isAdmin) {
            throw new ForbiddenException("无权查看其他用户信息");
        }

        return userService.getUserSummary(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "获取所有用户", description = "获取所有用户列表（管理员）")
    public List<UserSummaryResponse> getAllUsers() {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("无权查看所有用户信息");
        }
        return userService.getAllUserSummaries();
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "更新用户角色", description = "修改用户角色（管理员）")
    public ResponseEntity<User> updateUserRole(@PathVariable @NonNull Long id, @RequestParam @NonNull String role) {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("无权修改用户角色");
        }
        return ResponseEntity.ok(userService.updateRole(id, role));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户", description = "删除用户账户（管理员）")
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
    @Operation(summary = "获取当前用户", description = "获取当前登录用户的详细信息")
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
    @Operation(summary = "更新个人资料", description = "更新当前用户的姓名、邮箱、手机号")
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

        User updatedUser = userService.updateProfile(userId, request);
        UserSummaryResponse summary = userService.getUserSummary(updatedUser.getId()).orElse(null);
        return ResponseEntity.ok(summary != null ? summary : updatedUser);
    }

    @PostMapping("/avatar")
    @Operation(summary = "上传头像", description = "上传当前用户头像，支持 jpg/png/gif/webp 格式，最大 5MB")
    public ResponseEntity<?> uploadAvatar(@RequestParam("avatar") MultipartFile file) {
        Long userId = getAuthenticatedUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Avatar file is required"));
        }
        if (file.getSize() > MAX_AVATAR_SIZE) {
            return ResponseEntity.badRequest().body(new MessageResponse("Avatar file must not exceed 5MB"));
        }

        String extension = resolveExtension(file.getOriginalFilename());
        if (!ALLOWED_AVATAR_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Only jpg/png/gif/webp avatar files are allowed"));
        }

        try {
            Path avatarUploadDir = resolveUploadRoot().resolve("avatars");
            Files.createDirectories(avatarUploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = avatarUploadDir.resolve(filename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target);
            }

            String avatarUrl = "/uploads/avatars/" + filename;
            userService.updateAvatar(userId, avatarUrl);
            Map<String, String> response = new HashMap<>();
            response.put("avatar", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Avatar upload failed"));
        }
    }

    @DeleteMapping("/avatar")
    @Operation(summary = "移除头像", description = "移除当前用户头像")
    public ResponseEntity<?> removeAvatar() {
        Long userId = getAuthenticatedUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        userService.removeAvatar(userId);
        Map<String, String> response = new HashMap<>();
        response.put("avatar", "");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "管理员更新用户", description = "管理员编辑用户资料")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull UpdateProfileRequest request) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(403).body(new MessageResponse("只有管理员可以编辑用户资料"));
        }
        User updatedUser = userService.updateUserByAdmin(id, request);
        UserSummaryResponse summary = userService.getUserSummary(updatedUser.getId()).orElse(null);
        return ResponseEntity.ok(summary != null ? summary : updatedUser);
    }

    @PutMapping("/password")
    @Operation(summary = "修改密码", description = "修改当前用户的登录密码")
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

        userService.updatePassword(userId, request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    private String resolveExtension(String originalFilename) {
        String originalName = Objects.requireNonNullElse(originalFilename, "");
        int dotIndex = originalName.lastIndexOf('.');
        return dotIndex >= 0 ? originalName.substring(dotIndex).toLowerCase() : "";
    }

    private Path resolveUploadRoot() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }
}

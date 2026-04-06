package com.bookstore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Objects;
import java.util.Set;

@RestController
@RequestMapping("/api/uploads")
@Tag(name = "文件上传", description = "图书封面上传接口（管理员）")
public class UploadController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    @Operation(summary = "上传图书封面", description = "上传图书封面图片，支持 jpg/png/gif/webp 格式，最大 5MB")
    @PostMapping("/books")
    public ResponseEntity<Map<String, String>> uploadBookCover(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 检查文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "文件大小不能超过5MB");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "");
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex).toLowerCase();
            }

            // 检查文件类型
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "只允许上传 jpg/png/gif/webp 格式的图片");
                return ResponseEntity.badRequest().body(error);
            }

            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "books");
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target);
            Map<String, String> response = new HashMap<>();
            response.put("url", "/uploads/books/" + filename);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

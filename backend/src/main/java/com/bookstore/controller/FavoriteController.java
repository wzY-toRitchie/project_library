package com.bookstore.controller;

import com.bookstore.entity.Favorite;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "收藏", description = "图书收藏管理接口")
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Operation(summary = "获取收藏列表", description = "获取当前用户收藏的图书列表")
    @GetMapping
    public ResponseEntity<List<Favorite>> getUserFavorites() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Favorite> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    @Operation(summary = "检查收藏状态", description = "检查当前用户是否已收藏指定图书")
    @GetMapping("/check/{bookId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @Parameter(description = "图书 ID") @PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isFavorited = favoriteService.isFavorited(userId, bookId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorited", isFavorited);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "添加收藏", description = "收藏指定图书")
    @PostMapping("/{bookId}")
    public ResponseEntity<?> addFavorite(
            @Parameter(description = "图书 ID") @PathVariable Long bookId) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            Favorite favorite = favoriteService.addFavorite(userId, bookId);
            return ResponseEntity.ok(favorite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "取消收藏", description = "取消对指定图书的收藏")
    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> removeFavorite(
            @Parameter(description = "图书 ID") @PathVariable Long bookId) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            favoriteService.removeFavorite(userId, bookId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "切换收藏状态", description = "如果已收藏则取消，未收藏则添加")
    @PostMapping("/toggle/{bookId}")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(
            @Parameter(description = "图书 ID") @PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isFavorited = favoriteService.toggleFavorite(userId, bookId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorited", isFavorited);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "获取收藏数量", description = "获取当前用户收藏的图书总数")
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getFavoriteCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = favoriteService.getFavoriteCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "清空收藏", description = "清空当前用户的所有收藏")
    @DeleteMapping
    public ResponseEntity<?> clearFavorites() {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.clearUserFavorites(userId);
        return ResponseEntity.ok().build();
    }
}

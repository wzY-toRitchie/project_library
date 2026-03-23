package com.bookstore.controller;

import com.bookstore.entity.Favorite;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * 获取当前用户的收藏列表
     */
    @GetMapping
    public ResponseEntity<List<Favorite>> getUserFavorites() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Favorite> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    /**
     * 检查是否收藏了某本图书
     */
    @GetMapping("/check/{bookId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(@PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isFavorited = favoriteService.isFavorited(userId, bookId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorited", isFavorited);
        return ResponseEntity.ok(response);
    }

    /**
     * 添加收藏
     */
    @PostMapping("/{bookId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long bookId) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            Favorite favorite = favoriteService.addFavorite(userId, bookId);
            return ResponseEntity.ok(favorite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long bookId) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            favoriteService.removeFavorite(userId, bookId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 切换收藏状态
     */
    @PostMapping("/toggle/{bookId}")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(@PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isFavorited = favoriteService.toggleFavorite(userId, bookId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorited", isFavorited);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户收藏数量
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getFavoriteCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = favoriteService.getFavoriteCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * 清空所有收藏
     */
    @DeleteMapping
    public ResponseEntity<?> clearFavorites() {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.clearUserFavorites(userId);
        return ResponseEntity.ok().build();
    }
}

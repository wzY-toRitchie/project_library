package com.bookstore.controller;

import com.bookstore.entity.BrowsingHistory;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.BrowsingHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class BrowsingHistoryController {

    @Autowired
    private BrowsingHistoryService browsingHistoryService;

    /**
     * 获取当前用户的浏览历史
     */
    @GetMapping
    public ResponseEntity<List<BrowsingHistory>> getBrowsingHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<BrowsingHistory> history = browsingHistoryService.getUserBrowsingHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * 获取最近的浏览历史（限制数量）
     */
    @GetMapping("/recent")
    public ResponseEntity<List<BrowsingHistory>> getRecentBrowsingHistory(
            @RequestParam(defaultValue = "6") int limit) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<BrowsingHistory> history = browsingHistoryService.getRecentBrowsingHistory(userId, limit);
        return ResponseEntity.ok(history);
    }

    /**
     * 记录浏览
     */
    @PostMapping("/{bookId}")
    public ResponseEntity<BrowsingHistory> recordBrowsing(@PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        BrowsingHistory history = browsingHistoryService.recordBrowsing(userId, bookId);
        return ResponseEntity.ok(history);
    }

    /**
     * 删除单条浏览记录
     */
    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> deleteBrowsingHistory(@PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        browsingHistoryService.deleteBrowsingHistory(userId, bookId);
        return ResponseEntity.ok().build();
    }

    /**
     * 清空所有浏览历史
     */
    @DeleteMapping
    public ResponseEntity<?> clearBrowsingHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        browsingHistoryService.clearUserBrowsingHistory(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 获取浏览历史数量
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getBrowsingHistoryCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = browsingHistoryService.getBrowsingHistoryCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}

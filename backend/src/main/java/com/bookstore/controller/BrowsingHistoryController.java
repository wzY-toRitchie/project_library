package com.bookstore.controller;

import com.bookstore.entity.BrowsingHistory;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.BrowsingHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "浏览历史", description = "用户图书浏览历史管理接口")
@RestController
@RequestMapping("/api/history")
public class BrowsingHistoryController {

    @Autowired
    private BrowsingHistoryService browsingHistoryService;

    @Operation(summary = "获取浏览历史", description = "获取当前用户的图书浏览历史列表")
    @GetMapping
    public ResponseEntity<List<BrowsingHistory>> getBrowsingHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<BrowsingHistory> history = browsingHistoryService.getUserBrowsingHistory(userId);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "获取最近浏览", description = "获取最近浏览的图书（默认 6 本）")
    @GetMapping("/recent")
    public ResponseEntity<List<BrowsingHistory>> getRecentBrowsingHistory(
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "6") int limit) {
        Long userId = SecurityUtils.getCurrentUserId();
        List<BrowsingHistory> history = browsingHistoryService.getRecentBrowsingHistory(userId, limit);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "记录浏览", description = "记录当前用户浏览了某本图书")
    @PostMapping("/{bookId}")
    public ResponseEntity<BrowsingHistory> recordBrowsing(
            @Parameter(description = "图书 ID") @PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        BrowsingHistory history = browsingHistoryService.recordBrowsing(userId, bookId);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "删除浏览记录", description = "删除当前用户对某本图书的浏览记录")
    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> deleteBrowsingHistory(
            @Parameter(description = "图书 ID") @PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        browsingHistoryService.deleteBrowsingHistory(userId, bookId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "清空浏览历史", description = "清空当前用户的所有浏览历史")
    @DeleteMapping
    public ResponseEntity<?> clearBrowsingHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        browsingHistoryService.clearUserBrowsingHistory(userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "获取浏览数量", description = "获取当前用户浏览历史的总数量")
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getBrowsingHistoryCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        long count = browsingHistoryService.getBrowsingHistoryCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}

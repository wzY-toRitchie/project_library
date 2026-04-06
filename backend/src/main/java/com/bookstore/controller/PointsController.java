package com.bookstore.controller;

import com.bookstore.entity.PointsHistory;
import com.bookstore.payload.request.PointsAdjustRequest;
import com.bookstore.payload.response.PointsRuleResponse;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.PointsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "积分", description = "用户积分签到与历史记录接口")
@RestController
@RequestMapping("/api/points")
public class PointsController {

    @Autowired
    private PointsService pointsService;

    @Operation(summary = "获取积分余额", description = "获取当前用户的积分余额和当日签到状态")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserPoints() {
        Long userId = SecurityUtils.getCurrentUserId();
        Integer points = pointsService.getUserPoints(userId);
        boolean signedInToday = pointsService.hasSignedInToday(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("points", points);
        response.put("signedInToday", signedInToday);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "获取积分历史", description = "获取当前用户的积分变动记录")
    @GetMapping("/history")
    public ResponseEntity<List<PointsHistory>> getPointsHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<PointsHistory> history = pointsService.getUserPointsHistory(userId);
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "每日签到", description = "每日签到领取积分，每天只能签到一次")
    @PostMapping("/sign-in")
    public ResponseEntity<?> signIn() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            PointsHistory history = pointsService.signIn(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("points", history.getPoints());
            response.put("message", "签到成功，获得" + history.getPoints() + "积分");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "获取签到状态", description = "获取当前用户当日是否已签到")
    @GetMapping("/sign-in/status")
    public ResponseEntity<Map<String, Boolean>> getSignInStatus() {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean signedInToday = pointsService.hasSignedInToday(userId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("signedInToday", signedInToday);
        return ResponseEntity.ok(response);
    }

    // ============ 管理员接口 ============

    @Operation(summary = "获取积分规则", description = "管理员查看所有积分规则配置")
    @GetMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PointsRuleResponse>> getRuleSettings() {
        List<PointsRuleResponse> rules = pointsService.getRuleSettings();
        return ResponseEntity.ok(rules);
    }

    @Operation(summary = "更新积分规则", description = "管理员修改指定积分规则")
    @PutMapping("/rules/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRuleSetting(
            @PathVariable("key") @Parameter(description = "规则键名") String key,
            @RequestBody Map<String, Object> request) {
        try {
            Integer newValue = Integer.valueOf(request.get("ruleValue").toString());
            String updater = SecurityUtils.getCurrentUsername();
            PointsRuleResponse response = pointsService.updateRuleSetting(key, newValue, updater);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "调整用户积分", description = "管理员手动增减指定用户积分")
    @PostMapping("/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adjustUserPoints(@RequestBody PointsAdjustRequest request) {
        try {
            String operator = SecurityUtils.getCurrentUsername();
            PointsHistory history = pointsService.adjustUserPoints(
                    request.getUserId(),
                    request.getPoints(),
                    request.getReason(),
                    operator
            );
            Map<String, Object> response = new HashMap<>();
            response.put("message", request.getPoints() > 0 ? "积分增加成功" : "积分扣减成功");
            response.put("points", history.getPoints());
            response.put("currentPoints", pointsService.getUserPoints(request.getUserId()));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

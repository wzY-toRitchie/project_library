package com.bookstore.controller;

import com.bookstore.entity.PointsHistory;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.PointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points")
public class PointsController {

    @Autowired
    private PointsService pointsService;

    /**
     * 获取当前用户积分余额
     */
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

    /**
     * 获取当前用户积分历史
     */
    @GetMapping("/history")
    public ResponseEntity<List<PointsHistory>> getPointsHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<PointsHistory> history = pointsService.getUserPointsHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * 每日签到
     */
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

    /**
     * 获取签到状态
     */
    @GetMapping("/sign-in/status")
    public ResponseEntity<Map<String, Boolean>> getSignInStatus() {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean signedInToday = pointsService.hasSignedInToday(userId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("signedInToday", signedInToday);
        return ResponseEntity.ok(response);
    }
}

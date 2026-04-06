package com.bookstore.controller;

import com.bookstore.payload.request.AiRecommendRequest;
import com.bookstore.payload.response.AiRecommendResponse;
import com.bookstore.service.AiRecommendationService;
import com.bookstore.service.AiRecommendationService.ApiTestResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "AI推荐", description = "AI智能图书推荐接口")
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    @Operation(summary = "AI推荐图书", description = "根据用户输入的阅读偏好，使用大模型智能推荐图书")
    @PostMapping("/recommend")
    public ResponseEntity<?> recommend(@Valid @RequestBody AiRecommendRequest request) {
        try {
            AiRecommendResponse response = aiRecommendationService.recommend(request.getMessage());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "测试AI API连接", description = "测试配置的AI API是否可以正常连接")
    @PostMapping("/test-connection")
    public ResponseEntity<ApiTestResult> testConnection() {
        ApiTestResult result = aiRecommendationService.testApiConnection();
        return ResponseEntity.ok(result);
    }
}

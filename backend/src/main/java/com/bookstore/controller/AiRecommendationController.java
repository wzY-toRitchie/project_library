package com.bookstore.controller;

import com.bookstore.payload.request.AiRecommendRequest;
import com.bookstore.payload.response.AiRecommendResponse;
import com.bookstore.service.AiRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "AI推荐", description = "AI智能图书推荐接口")
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    @Operation(summary = "AI推荐图书", description = "根据用户输入的阅读偏好，使用大模型智能推荐图书")
    @PostMapping("/recommend")
    public ResponseEntity<AiRecommendResponse> recommend(@Valid @RequestBody AiRecommendRequest request) {
        AiRecommendResponse response = aiRecommendationService.recommend(request.getMessage());
        return ResponseEntity.ok(response);
    }
}

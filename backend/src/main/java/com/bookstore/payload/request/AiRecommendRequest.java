package com.bookstore.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiRecommendRequest {
    @NotBlank(message = "请输入推荐需求")
    private String message;
}

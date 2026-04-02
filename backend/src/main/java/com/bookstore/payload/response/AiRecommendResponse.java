package com.bookstore.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
public class AiRecommendResponse {
    private String reply;
    private String summary;
    private List<RecommendationItem> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationItem {
        private Long bookId;
        private String title;
        private String author;
        private String reason;
        private Integer matchScore;
        private String coverImage;
        private Double price;
    }
}

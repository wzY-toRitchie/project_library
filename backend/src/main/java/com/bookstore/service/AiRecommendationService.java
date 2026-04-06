package com.bookstore.service;

import com.bookstore.config.AiConfig;
import com.bookstore.entity.Book;
import com.bookstore.payload.response.AiRecommendResponse;
import com.bookstore.payload.response.AiRecommendResponse.RecommendationItem;
import com.bookstore.repository.*;
import com.bookstore.security.SecurityUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final AiConfig aiConfig;
    private final SystemSettingService settingService;
    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final BrowsingHistoryRepository browsingHistoryRepository;
    private final FavoriteRepository favoriteRepository;
    private final ObjectMapper objectMapper;

    /**
     * AI 推荐图书
     */
    public AiRecommendResponse recommend(String userMessage) {
        var settings = settingService.getSettings();
        
        String apiKey = getApiKey(settings);
        String baseUrl = getBaseUrl(settings);
        String model = getModel(settings);
        double temperature = settings.getAiTemperature() != null ? settings.getAiTemperature() : 0.7;
        int maxTokens = settings.getAiMaxTokens() != null ? settings.getAiMaxTokens() : 2000;

        // 检查 API Key 是否为空
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("AI API Key 未配置，请在系统设置中配置 API Key");
        }

        log.info("Calling AI API - Base URL: {}, Model: {}", baseUrl, model);

        try {
            String bookList = buildBookList();
            String userContext = buildUserContext();
            String systemPrompt = buildSystemPrompt(bookList);
            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", "用户输入：" + userMessage + "\n\n用户行为数据：\n" + userContext)
                ),
                "temperature", temperature,
                "max_tokens", maxTokens
            );
            
            long startTime = System.currentTimeMillis();
            String responseJson = RestClient.create(baseUrl)
                .post().uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .header("HTTP-Referer", "http://localhost:5173")
                .header("X-OpenRouter-Title", "JavaBooks")
                .body(requestBody)
                .retrieve()
                .body(String.class);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("AI API response received successfully in {}ms", duration);
            return parseResponse(responseJson);
        } catch (Exception e) {
            log.error("AI API call failed - URL: {}, Model: {}, Error: {}", baseUrl, model, e.getMessage(), e);
            throw new RuntimeException("AI API 调用失败: " + e.getMessage());
        }
    }

    /**
     * 测试 API 连接
     */
    public ApiTestResult testApiConnection() {
        var settings = settingService.getSettings();
        
        String apiKey = getApiKey(settings);
        String baseUrl = getBaseUrl(settings);
        String model = getModel(settings);

        if (apiKey == null || apiKey.isEmpty()) {
            return ApiTestResult.failure("API Key 未配置");
        }

        try {
            log.info("Testing AI API connection - Base URL: {}, Model: {}", baseUrl, model);
            
            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "user", "content", "Hello, respond with 'OK'")
                ),
                "max_tokens", 10
            );
            
            long startTime = System.currentTimeMillis();
            String responseJson = RestClient.create(baseUrl)
                .post().uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .header("HTTP-Referer", "http://localhost:5173")
                .header("X-OpenRouter-Title", "JavaBooks")
                .body(requestBody)
                .retrieve()
                .body(String.class);
            long duration = System.currentTimeMillis() - startTime;

            // 验证响应格式
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                return ApiTestResult.failure("API 响应格式异常：未找到 choices");
            }

            log.info("AI API connection test successful in {}ms", duration);
            return ApiTestResult.success(duration, model, baseUrl);
        } catch (Exception e) {
            log.error("AI API connection test failed: {}", e.getMessage(), e);
            return ApiTestResult.failure("连接失败: " + e.getMessage());
        }
    }

    private String getApiKey(com.bookstore.entity.SystemSetting settings) {
        String dbKey = settings.getAiApiKey();
        String configKey = aiConfig.getApiKey();
        String result = (dbKey != null && !dbKey.isEmpty()) ? dbKey : configKey;
        log.debug("getApiKey - DB: {}, Config: {}, Result: {}", 
            dbKey != null ? (dbKey.isEmpty() ? "empty" : "***") : "null",
            configKey != null ? (configKey.isEmpty() ? "empty" : "***") : "null",
            result != null ? (result.isEmpty() ? "empty" : "***") : "null");
        return result;
    }

    private String getBaseUrl(com.bookstore.entity.SystemSetting settings) {
        return (settings.getAiBaseUrl() != null && !settings.getAiBaseUrl().isEmpty())
            ? settings.getAiBaseUrl() : aiConfig.getBaseUrl();
    }

    private String getModel(com.bookstore.entity.SystemSetting settings) {
        return (settings.getAiModel() != null && !settings.getAiModel().isEmpty())
            ? settings.getAiModel() : aiConfig.getModel();
    }

    private String buildUserContext() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            StringBuilder sb = new StringBuilder();
            var reviews = reviewRepository.findByUserId(userId);
            if (!reviews.isEmpty()) {
                sb.append("评分: ");
                reviews.forEach(r -> sb.append(r.getBook().getTitle()).append("(").append(r.getRating()).append("分), "));
                sb.append("\n");
            }
            var history = browsingHistoryRepository.findTop10ByUserIdOrderByLastViewTimeDesc(userId);
            if (!history.isEmpty()) {
                sb.append("浏览: ");
                history.forEach(h -> sb.append(h.getBook().getTitle()).append(", "));
                sb.append("\n");
            }
            var favorites = favoriteRepository.findByUserIdOrderByCreateTimeDesc(userId);
            if (!favorites.isEmpty()) {
                sb.append("收藏: ");
                favorites.forEach(f -> sb.append(f.getBook().getTitle()).append(", "));
            }
            return sb.length() > 0 ? sb.toString() : "无历史数据";
        } catch (Exception e) {
            return "无历史数据";
        }
    }

    private String buildBookList() {
        return bookRepository.findAll().stream()
            .map(b -> b.getTitle() + " - " + b.getAuthor()
                + " (" + (b.getCategory() != null ? b.getCategory().getName() : "未分类")
                + "，评分" + b.getRating() + ")")
            .collect(Collectors.joining("\n"));
    }

    private String buildSystemPrompt(String bookList) {
        var settings = settingService.getSettings();
        String customPrompt = settings.getAiSystemPrompt();
        
        // 如果有自定义提示词，使用它并替换变量
        if (customPrompt != null && !customPrompt.isEmpty()) {
            return customPrompt.replace("{bookList}", bookList);
        }
        
        // 默认提示词
        return "你是一位热情的线上书店AI阅读顾问\u201c书童\u201d。你热爱阅读，善于倾听，说话亲切自然像朋友一样。\n\n"
            + "## 书库\n" + bookList + "\n\n"
            + "## 任务\n1. 用100-150字亲切回复用户，分析其阅读偏好并说明推荐思路\n"
            + "2. 从书库推荐3-5本书，每本给出50-80字个性化理由\n\n"
            + "## 输出JSON格式\n"
            + "{\"reply\":\"你的亲切回复(100-150字)\",\"summary\":\"一句话总结(20字内)\",\"recommendations\":[{\"title\":\"书名\",\"author\":\"作者\",\"reason\":\"理由(50-80字)\",\"matchScore\":90}]}";
    }

    private AiRecommendResponse parseResponse(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new RuntimeException("API 响应格式异常：未找到 choices");
        }
        String content = choices.get(0).path("message").path("content").asText("");
        if (content.isEmpty()) {
            throw new RuntimeException("API 响应内容为空");
        }
        
        // 处理 markdown 代码块
        if (content.contains("```json")) {
            content = content.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();
        } else if (content.contains("```")) {
            content = content.replaceAll("```\\s*", "").trim();
        }
        
        // 尝试提取 JSON 对象
        int jsonStart = content.indexOf('{');
        int jsonEnd = content.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            content = content.substring(jsonStart, jsonEnd + 1);
        }
        
        log.debug("Parsed AI response content: {}", content);
        JsonNode data = objectMapper.readTree(content);

        AiRecommendResponse response = new AiRecommendResponse();
        String reply = data.path("reply").asText(null);
        String summary = data.path("summary").asText("为您推荐以下图书");
        response.setReply(reply != null && !reply.isEmpty() ? reply : summary);
        response.setSummary(summary);

        List<RecommendationItem> items = new ArrayList<>();
        for (JsonNode rec : data.path("recommendations")) {
            String title = rec.path("title").asText();
            if (title.isEmpty()) continue;
            Optional<Book> bookOpt = bookRepository.findAll().stream()
                .filter(b -> b.getTitle().contains(title) || title.contains(b.getTitle()))
                .findFirst();

            if (bookOpt.isPresent()) {
                Book b = bookOpt.get();
                items.add(new RecommendationItem(
                    b.getId(), b.getTitle(), b.getAuthor(),
                    rec.path("reason").asText("推荐好书"),
                    rec.path("matchScore").asInt(80),
                    b.getCoverImage(), b.getPrice().doubleValue()
                ));
            }
        }
        if (items.isEmpty()) {
            throw new RuntimeException("AI 未能从书库中匹配到推荐图书");
        }
        response.setRecommendations(items);
        return response;
    }

    /**
     * API 测试结果
     */
    public static class ApiTestResult {
        private boolean success;
        private String message;
        private Long responseTime;
        private String model;
        private String baseUrl;

        public static ApiTestResult success(Long responseTime, String model, String baseUrl) {
            ApiTestResult result = new ApiTestResult();
            result.success = true;
            result.message = "连接成功";
            result.responseTime = responseTime;
            result.model = model;
            result.baseUrl = baseUrl;
            return result;
        }

        public static ApiTestResult failure(String message) {
            ApiTestResult result = new ApiTestResult();
            result.success = false;
            result.message = message;
            return result;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Long getResponseTime() { return responseTime; }
        public String getModel() { return model; }
        public String getBaseUrl() { return baseUrl; }
    }
}

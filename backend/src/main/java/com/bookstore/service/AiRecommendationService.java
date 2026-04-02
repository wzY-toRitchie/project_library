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

    public AiRecommendResponse recommend(String userMessage) {
        var settings = settingService.getSettings();
        boolean mock = settings.getAiMock() != null ? settings.getAiMock() : aiConfig.isMock();
        if (mock) {
            return mockRecommend(userMessage);
        }
        try {
            String apiKey = (settings.getAiApiKey() != null && !settings.getAiApiKey().isEmpty())
                ? settings.getAiApiKey() : aiConfig.getApiKey();
            String baseUrl = (settings.getAiBaseUrl() != null && !settings.getAiBaseUrl().isEmpty())
                ? settings.getAiBaseUrl() : aiConfig.getBaseUrl();
            String model = (settings.getAiModel() != null && !settings.getAiModel().isEmpty())
                ? settings.getAiModel() : aiConfig.getModel();
            double temperature = settings.getAiTemperature() != null ? settings.getAiTemperature() : 0.7;
            int maxTokens = settings.getAiMaxTokens() != null ? settings.getAiMaxTokens() : 2000;

            String bookList = buildBookList();
            String userContext = buildUserContext();
            String systemPrompt = buildSystemPrompt(bookList);
            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", "用户输入：" + userMessage + "\n\n用户行为数据：\n" + userContext)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", temperature,
                "max_tokens", maxTokens
            );
            String responseJson = RestClient.create(baseUrl)
                .post().uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .header("HTTP-Referer", "http://localhost:5173")
                .header("X-OpenRouter-Title", "JavaBooks")
                .body(requestBody)
                .retrieve()
                .body(String.class);
            return parseResponse(responseJson);
        } catch (Exception e) {
            log.error("AI API failed: {}", e.getMessage());
            return mockRecommend(userMessage);
        }
    }

    private AiRecommendResponse mockRecommend(String message) {
        List<Book> books = bookRepository.findAll();
        List<RecommendationItem> items = new ArrayList<>();
        Random rand = new Random();
        String lowerMsg = message.toLowerCase();
        List<Book> matched = books.stream()
            .filter(b -> lowerMsg.contains(b.getTitle().toLowerCase())
                || lowerMsg.contains(b.getAuthor().toLowerCase())
                || (b.getCategory() != null && lowerMsg.contains(b.getCategory().getName().toLowerCase())))
            .collect(Collectors.toList());
        if (matched.isEmpty()) {
            Collections.shuffle(books, rand);
            matched = books.subList(0, Math.min(4, books.size()));
        }
        String[] reasons = {
            "这本书在书库中评分很高，值得一读。",
            "根据您的阅读偏好，这本书非常匹配。",
            "这本书是该领域的经典之作，强烈推荐。",
            "多位用户评价这本书充满启发，适合深入学习。"
        };
        for (int i = 0; i < Math.min(4, matched.size()); i++) {
            Book b = matched.get(i);
            items.add(new RecommendationItem(
                b.getId(), b.getTitle(), b.getAuthor(),
                reasons[rand.nextInt(reasons.length)],
                70 + rand.nextInt(30),
                b.getCoverImage(), b.getPrice().doubleValue()
            ));
        }
        AiRecommendResponse response = new AiRecommendResponse();
        response.setSummary("为您推荐以下图书");
        response.setRecommendations(items);
        return response;
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
        return "你是一位热情的线上书店AI阅读顾问\u201c书童\u201d。你热爱阅读，善于倾听，说话亲切自然像朋友一样。\n\n"
            + "## 书库\n" + bookList + "\n\n"
            + "## 任务\n1. 用100-150字亲切回复用户，分析其阅读偏好并说明推荐思路\n"
            + "2. 从书库推荐3-5本书，每本给出50-80字个性化理由\n\n"
            + "## 输出JSON格式\n"
            + "{\"reply\":\"你的亲切回复(100-150字)\",\"summary\":\"一句话总结(20字内)\",\"recommendations\":[{\"title\":\"书名\",\"author\":\"作者\",\"reason\":\"理由(50-80字)\",\"matchScore\":90}]}";
    }

    private AiRecommendResponse parseResponse(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        String content = root.path("choices").get(0).path("message").path("content").asText();
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
            items = mockRecommend("").getRecommendations();
        }
        response.setRecommendations(items);
        return response;
    }
}

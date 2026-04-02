package com.bookstore.controller;

import com.bookstore.entity.Review;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.bookstore.payload.request.ReviewRequest;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "评价", description = "图书评价管理接口")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 获取所有评价（管理员）
     */
    @GetMapping
    @Operation(summary = "获取所有评价", description = "管理员获取所有评价记录")
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    /**
     * 删除评价（管理员）
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除评价", description = "管理员删除指定评价")
    public Map<String, Object> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return Map.of("message", "评价已删除");
    }

    @PostMapping
    @Operation(summary = "提交评价", description = "对已购图书提交评分和评论")
    public Map<String, Object> createReview(@Valid @RequestBody ReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Review review = new Review();
        review.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在")));
        review.setBook(bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("图书不存在")));
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        reviewService.addReview(review);
        return Map.of("message", "评价提交成功");
    }

    @GetMapping("/book/{bookId}")
    @Operation(summary = "获取图书评价", description = "获取指定图书的所有评价")
    public List<Review> getReviewsByBook(@PathVariable @NonNull Long bookId) {
        return reviewService.getReviewsByBookId(bookId);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "获取用户评价", description = "获取指定用户的所有评价记录")
    public List<Review> getReviewsByUser(@PathVariable @NonNull Long userId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();
        if (!userId.equals(currentUserId) && !isAdmin) {
            throw new RuntimeException("无权查看其他用户的评价");
        }
        return reviewService.getReviewsByUserId(userId);
    }
}

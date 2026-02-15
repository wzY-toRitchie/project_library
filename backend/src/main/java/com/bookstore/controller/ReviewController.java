package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public Review createReview(@RequestBody Map<String, Object> payload) {
        // Simple manual parsing for now, or could use DTO
        Long userId = Long.valueOf(payload.get("userId").toString());
        Long bookId = Long.valueOf(payload.get("bookId").toString());
        Integer rating = Integer.valueOf(payload.get("rating").toString());
        String comment = (String) payload.get("comment");

        Review review = new Review();
        User user = new User();
        user.setId(userId);
        review.setUser(user);

        Book book = new Book();
        book.setId(bookId);
        review.setBook(book);

        review.setRating(rating);
        review.setComment(comment);

        return reviewService.addReview(review);
    }

    @GetMapping("/book/{bookId}")
    public List<Review> getReviewsByBook(@PathVariable @NonNull Long bookId) {
        return reviewService.getReviewsByBookId(bookId);
    }

    @GetMapping("/user/{userId}")
    public List<Review> getReviewsByUser(@PathVariable @NonNull Long userId) {
        return reviewService.getReviewsByUserId(userId);
    }
}

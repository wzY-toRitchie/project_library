package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.payload.request.ReviewRequest;
import com.bookstore.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public Review createReview(@Valid @RequestBody ReviewRequest request) {
        Review review = new Review();
        
        User user = new User();
        user.setId(request.getUserId());
        review.setUser(user);

        Book book = new Book();
        book.setId(request.getBookId());
        review.setBook(book);

        review.setRating(request.getRating());
        review.setComment(request.getComment());

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

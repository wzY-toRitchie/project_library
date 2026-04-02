package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.service.BookService;
import com.bookstore.service.OrderService;
import com.bookstore.service.CategoryService;
import com.bookstore.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "首页", description = "首页聚合数据接口")
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final BookService bookService;
    private final OrderService orderService;
    private final CategoryService categoryService;

    @Operation(summary = "获取热销榜", description = "获取销量最高的图书")
    @GetMapping("/bestsellers")
    public ResponseEntity<List<Book>> getBestsellers(
            @RequestParam(defaultValue = "10") int size) {
        var books = bookService.getAllBooks(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "rating")));
        return ResponseEntity.ok(books.getContent());
    }

    @Operation(summary = "获取新书上架", description = "获取最新添加的图书")
    @GetMapping("/new-arrivals")
    public ResponseEntity<List<Book>> getNewArrivals(
            @RequestParam(defaultValue = "8") int size) {
        var books = bookService.getAllBooks(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return ResponseEntity.ok(books.getContent());
    }

    @Operation(summary = "获取好评榜", description = "获取评分最高的图书")
    @GetMapping("/top-rated")
    public ResponseEntity<List<Book>> getTopRated(
            @RequestParam(defaultValue = "8") int size) {
        var books = bookService.getAllBooks(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "rating")));
        return ResponseEntity.ok(books.getContent());
    }

    @Operation(summary = "获取热门分类", description = "获取所有分类")
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @Operation(summary = "获取编辑精选", description = "获取管理员精选的图书")
    @GetMapping("/featured")
    public ResponseEntity<List<Book>> getFeatured(
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(bookService.getFeaturedBooks(size));
    }

    @Operation(summary = "获取首页数据", description = "聚合所有首页数据，减少请求次数")
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getHomePageData() {
        Map<String, Object> data = new HashMap<>();
        data.put("bestsellers", bookService.getAllBooks(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "rating"))).getContent());
        data.put("newArrivals", bookService.getAllBooks(PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createTime"))).getContent());
        data.put("topRated", bookService.getAllBooks(PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "rating"))).getContent());
        data.put("featured", bookService.getFeaturedBooks(8));
        data.put("categories", categoryService.getAllCategories());
        return ResponseEntity.ok(data);
    }
}
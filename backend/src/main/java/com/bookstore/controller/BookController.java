package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.payload.response.PageResponse;
import com.bookstore.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@Tag(name = "图书", description = "图书查询和管理接口")
public class BookController {

    @Autowired
    private BookService bookService;

    @Operation(summary = "获取所有图书", description = "分页获取图书列表，支持排序")
    @GetMapping
    public PageResponse<Book> getAllBooks(
            @RequestParam(required = false, defaultValue = "createTime") @NonNull String sortBy,
            @RequestParam(required = false, defaultValue = "desc") @NonNull String direction,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Page<Book> bookPage = bookService.getAllBooks(PageRequest.of(page, size, sort));
        return new PageResponse<>(bookPage.getContent(), page, size, bookPage.getTotalElements());
    }

    @Operation(summary = "获取图书详情", description = "根据 ID 获取单本图书信息")
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable @NonNull Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "按分类获取图书", description = "根据分类 ID 分页获取图书")
    @GetMapping("/category/{categoryId}")
    public PageResponse<Book> getBooksByCategory(
            @PathVariable @NonNull Long categoryId,
            @RequestParam(required = false, defaultValue = "createTime") @NonNull String sortBy,
            @RequestParam(required = false, defaultValue = "desc") @NonNull String direction,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Page<Book> bookPage = bookService.getBooksByCategory(categoryId, PageRequest.of(page, size, sort));
        return new PageResponse<>(bookPage.getContent(), page, size, bookPage.getTotalElements());
    }

    @Operation(summary = "搜索图书", description = "支持关键词搜索，可按分类和排序筛选")
    @GetMapping("/search")
    public PageResponse<Book> searchBooks(
            @RequestParam @NonNull String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "relevance") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
        
        Sort sort;
        switch (sortBy) {
            case "price_asc":
                sort = Sort.by(Sort.Direction.ASC, "price");
                break;
            case "price_desc":
                sort = Sort.by(Sort.Direction.DESC, "price");
                break;
            case "rating":
                sort = Sort.by(Sort.Direction.DESC, "rating");
                break;
            case "newest":
                sort = Sort.by(Sort.Direction.DESC, "createTime");
                break;
            default: // relevance - 按创建时间排序
                sort = Sort.by(Sort.Direction.DESC, "createTime");
        }
        
        Page<Book> bookPage;
        if (categoryId != null) {
            bookPage = bookService.searchByKeywordAndCategory(keyword, categoryId, PageRequest.of(page, size, sort));
        } else {
            bookPage = bookService.searchByKeyword(keyword, PageRequest.of(page, size, sort));
        }
        
        return new PageResponse<>(bookPage.getContent(), page, size, bookPage.getTotalElements());
    }

    @Operation(summary = "搜索建议", description = "根据关键词返回搜索建议")
    @GetMapping("/search/suggestions")
    public List<String> getSearchSuggestions(@RequestParam @NonNull String keyword) {
        return bookService.getSearchSuggestions(keyword);
    }

    @Operation(summary = "热门搜索", description = "获取热门搜索关键词")
    @GetMapping("/search/hot")
    public List<String> getHotSearches() {
        return bookService.getHotSearches();
    }

    @Operation(summary = "创建图书", description = "新增一本图书（管理员）")
    @PostMapping
    public Book createBook(@RequestBody @NonNull Book book) {
        return bookService.saveBook(book);
    }

    @Operation(summary = "更新图书", description = "更新图书信息（管理员）")
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable @NonNull Long id, @RequestBody @NonNull Book bookDetails) {
        return bookService.getBookById(id).map(book -> {
            book.setTitle(bookDetails.getTitle());
            book.setAuthor(bookDetails.getAuthor());
            book.setPrice(bookDetails.getPrice());
            book.setStock(bookDetails.getStock());
            book.setDescription(bookDetails.getDescription());
            book.setCategory(bookDetails.getCategory());
            book.setCoverImage(bookDetails.getCoverImage());
            book.setFeatured(bookDetails.getFeatured());
            return ResponseEntity.ok(bookService.saveBook(book));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "删除图书", description = "删除图书（管理员）")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable @NonNull Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}

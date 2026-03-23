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
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

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

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable @NonNull Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

    @GetMapping("/search/suggestions")
    public List<String> getSearchSuggestions(@RequestParam @NonNull String keyword) {
        return bookService.getSearchSuggestions(keyword);
    }

    @GetMapping("/search/hot")
    public List<String> getHotSearches() {
        return bookService.getHotSearches();
    }

    @PostMapping
    public Book createBook(@RequestBody @NonNull Book book) {
        return bookService.saveBook(book);
    }

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
            return ResponseEntity.ok(bookService.saveBook(book));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable @NonNull Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}

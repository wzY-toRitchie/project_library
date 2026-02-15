package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public List<Book> getAllBooks(
            @RequestParam(required = false, defaultValue = "createTime") @NonNull String sortBy,
            @RequestParam(required = false, defaultValue = "desc") @NonNull String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return bookService.getAllBooks(sort);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable @NonNull Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public List<Book> getBooksByCategory(
            @PathVariable @NonNull Long categoryId,
            @RequestParam(required = false, defaultValue = "createTime") @NonNull String sortBy,
            @RequestParam(required = false, defaultValue = "desc") @NonNull String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        return bookService.getBooksByCategory(categoryId, sort);
    }

    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam @NonNull String title) {
        return bookService.searchBooks(title);
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

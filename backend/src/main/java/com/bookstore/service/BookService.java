package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> getAllBooks(@NonNull Sort sort) {
        return bookRepository.findAll(sort);
    }

    public Page<Book> getAllBooks(@NonNull Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    public Optional<Book> getBookById(@NonNull Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> getBooksByCategory(@NonNull Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public List<Book> getBooksByCategory(@NonNull Long categoryId, @NonNull Sort sort) {
        return bookRepository.findByCategoryId(categoryId, sort);
    }

    public Page<Book> getBooksByCategory(@NonNull Long categoryId, @NonNull Pageable pageable) {
        return bookRepository.findByCategoryId(categoryId, pageable);
    }

    public List<Book> searchBooks(@NonNull String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    // 多字段搜索
    public Page<Book> searchByKeyword(@NonNull String keyword, @NonNull Pageable pageable) {
        return bookRepository.searchByKeyword(keyword, pageable);
    }

    // 多字段搜索 + 分类筛选
    public Page<Book> searchByKeywordAndCategory(@NonNull String keyword, @NonNull Long categoryId, @NonNull Pageable pageable) {
        return bookRepository.searchByKeywordAndCategory(keyword, categoryId, pageable);
    }

    // 获取搜索建议
    public List<String> getSearchSuggestions(@NonNull String keyword) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCase(keyword);
        return books.stream()
                .map(Book::getTitle)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }

    // 获取热门搜索词
    public List<String> getHotSearches() {
        try {
            return bookRepository.findTopSellingBookTitles(PageRequest.of(0, 6));
        } catch (Exception e) {
            // 如果查询失败，返回空列表
            return List.of();
        }
    }

    public Book saveBook(@NonNull Book book) {
        return bookRepository.save(book);
    }

    public List<Book> getFeaturedBooks(int limit) {
        return bookRepository.findByFeaturedTrue(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "rating")));
    }

    public void deleteBook(@NonNull Long id) {
        bookRepository.deleteById(id);
    }
}

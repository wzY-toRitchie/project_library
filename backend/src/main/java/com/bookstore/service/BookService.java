package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

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

    public Optional<Book> getBookById(@NonNull Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> getBooksByCategory(@NonNull Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public List<Book> getBooksByCategory(@NonNull Long categoryId, @NonNull Sort sort) {
        return bookRepository.findByCategoryId(categoryId, sort);
    }

    public List<Book> searchBooks(@NonNull String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public Book saveBook(@NonNull Book book) {
        return bookRepository.save(book);
    }

    public void deleteBook(@NonNull Long id) {
        bookRepository.deleteById(id);
    }
}

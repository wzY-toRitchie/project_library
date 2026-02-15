package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByCategoryId(Long categoryId);
    List<Book> findByCategoryId(Long categoryId, Sort sort);
    List<Book> findByTitleContainingIgnoreCase(String title);
    boolean existsByCategoryId(Long categoryId);
}

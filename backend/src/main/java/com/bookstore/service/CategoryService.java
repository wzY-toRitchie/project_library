package com.bookstore.service;

import com.bookstore.entity.Category;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Cacheable(value = "categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(Category category) {
        String name = category == null ? null : category.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("分类名称不能为空");
        }
        String normalized = name.trim();
        if (categoryRepository.existsByNameIgnoreCase(normalized)) {
            throw new RuntimeException("分类已存在");
        }
        Category entity = new Category();
        entity.setName(normalized);
        return categoryRepository.save(entity);
    }

    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(@NonNull Long id, Category category) {
        String name = category == null ? null : category.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("分类名称不能为空");
        }
        String normalized = name.trim();
        return categoryRepository.findById(id).map(existing -> {
            if (!existing.getName().equalsIgnoreCase(normalized)
                    && categoryRepository.existsByNameIgnoreCase(normalized)) {
                throw new RuntimeException("分类已存在");
            }
            existing.setName(normalized);
            return categoryRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("分类不存在"));
    }

    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(@NonNull Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("分类不存在");
        }
        if (bookRepository.existsByCategoryId(id)) {
            throw new RuntimeException("该分类下存在图书，无法删除");
        }
        categoryRepository.deleteById(id);
    }
}

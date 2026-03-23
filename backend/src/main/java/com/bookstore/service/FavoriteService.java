package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Favorite;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.FavoriteRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    /**
     * 获取用户的收藏列表
     */
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreateTimeDesc(userId);
    }

    /**
     * 检查用户是否收藏了某本图书
     */
    public boolean isFavorited(Long userId, Long bookId) {
        return favoriteRepository.existsByUserIdAndBookId(userId, bookId);
    }

    /**
     * 添加收藏
     */
    @Transactional
    public Favorite addFavorite(Long userId, Long bookId) {
        // 检查是否已收藏
        if (favoriteRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new RuntimeException("已经收藏过这本书");
        }

        // 获取用户和图书
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("图书不存在"));

        // 创建收藏
        Favorite favorite = new Favorite(user, book);
        return favoriteRepository.save(favorite);
    }

    /**
     * 取消收藏
     */
    @Transactional
    public void removeFavorite(Long userId, Long bookId) {
        if (!favoriteRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new RuntimeException("未收藏这本书");
        }
        favoriteRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    /**
     * 切换收藏状态
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long bookId) {
        if (favoriteRepository.existsByUserIdAndBookId(userId, bookId)) {
            favoriteRepository.deleteByUserIdAndBookId(userId, bookId);
            return false; // 取消收藏
        } else {
            addFavorite(userId, bookId);
            return true; // 添加收藏
        }
    }

    /**
     * 获取用户收藏数量
     */
    public long getFavoriteCount(Long userId) {
        return favoriteRepository.countByUserId(userId);
    }

    /**
     * 获取图书被收藏次数
     */
    public long getBookFavoriteCount(Long bookId) {
        return favoriteRepository.countByBookId(bookId);
    }

    /**
     * 清空用户所有收藏
     */
    @Transactional
    public void clearUserFavorites(Long userId) {
        favoriteRepository.deleteByUserId(userId);
    }
}

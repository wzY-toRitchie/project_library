package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.BrowsingHistory;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.BrowsingHistoryRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BrowsingHistoryService {

    @Autowired
    private BrowsingHistoryRepository browsingHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    /**
     * 记录浏览
     */
    @Transactional
    public BrowsingHistory recordBrowsing(Long userId, Long bookId) {
        // 检查是否已存在记录
        Optional<BrowsingHistory> existing = browsingHistoryRepository.findByUserIdAndBookId(userId, bookId);

        if (existing.isPresent()) {
            // 更新现有记录
            BrowsingHistory history = existing.get();
            history.updateView();
            return browsingHistoryRepository.save(history);
        } else {
            // 创建新记录
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("图书不存在"));

            BrowsingHistory history = new BrowsingHistory(user, book);
            return browsingHistoryRepository.save(history);
        }
    }

    /**
     * 获取用户的浏览历史
     */
    public List<BrowsingHistory> getUserBrowsingHistory(Long userId) {
        return browsingHistoryRepository.findByUserIdOrderByLastViewTimeDesc(userId);
    }

    /**
     * 获取用户的最近N条浏览历史
     */
    public List<BrowsingHistory> getRecentBrowsingHistory(Long userId, int limit) {
        if (limit <= 0) {
            limit = 10;
        }
        List<BrowsingHistory> history = browsingHistoryRepository.findByUserIdOrderByLastViewTimeDesc(userId);
        return history.stream().limit(limit).toList();
    }

    /**
     * 删除单条浏览记录
     */
    @Transactional
    public void deleteBrowsingHistory(Long userId, Long bookId) {
        browsingHistoryRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    /**
     * 清空用户所有浏览历史
     */
    @Transactional
    public void clearUserBrowsingHistory(Long userId) {
        browsingHistoryRepository.deleteByUserId(userId);
    }

    /**
     * 获取用户浏览历史数量
     */
    public long getBrowsingHistoryCount(Long userId) {
        return browsingHistoryRepository.countByUserId(userId);
    }

    /**
     * 获取用户最近浏览的图书ID列表
     */
    public List<Long> getRecentBookIds(Long userId, int limit) {
        List<Long> bookIds = browsingHistoryRepository.findRecentBookIdsByUserId(userId);
        return bookIds.stream().limit(limit).toList();
    }
}

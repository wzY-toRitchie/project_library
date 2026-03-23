package com.bookstore.repository;

import com.bookstore.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop10ByOrderByCreateTimeDesc();

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false")
    int markAllAsRead();
}

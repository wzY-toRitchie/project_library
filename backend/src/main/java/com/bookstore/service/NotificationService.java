package com.bookstore.service;

import com.bookstore.entity.Notification;
import com.bookstore.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getRecentNotifications() {
        return notificationRepository.findTop10ByOrderByCreateTimeDesc();
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
    }

    public Notification createNotification(String type, String message) {
        return notificationRepository.save(new Notification(type, message));
    }
}

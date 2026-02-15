package com.bookstore.controller;

import com.bookstore.entity.Notification;
import com.bookstore.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getNotifications() {
        return notificationRepository.findTop10ByOrderByCreateTimeDesc();
    }

    @PostMapping("/mark-read")
    public void markAllRead() {
        List<Notification> notifications = notificationRepository.findAll();
        for (Notification n : notifications) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }
}

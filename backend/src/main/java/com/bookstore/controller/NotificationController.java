package com.bookstore.controller;

import com.bookstore.entity.Notification;
import com.bookstore.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications() {
        return notificationService.getRecentNotifications();
    }

    @PostMapping("/mark-read")
    public void markAllRead() {
        notificationService.markAllAsRead();
    }
}

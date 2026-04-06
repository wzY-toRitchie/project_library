package com.bookstore.controller;

import com.bookstore.entity.Notification;
import com.bookstore.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "系统通知", description = "用户通知管理接口")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Operation(summary = "获取通知列表", description = "获取当前用户最近的通知消息")
    @GetMapping
    public List<Notification> getNotifications() {
        return notificationService.getRecentNotifications();
    }

    @Operation(summary = "全部标记为已读", description = "将当前用户所有未读通知标记为已读")
    @PostMapping("/mark-read")
    public void markAllRead() {
        notificationService.markAllAsRead();
    }
}

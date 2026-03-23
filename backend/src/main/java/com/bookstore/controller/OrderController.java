package com.bookstore.controller;

import com.bookstore.entity.Order;
import com.bookstore.enums.OrderStatus;
import com.bookstore.payload.request.OrderCreateRequest;
import com.bookstore.payload.response.PageResponse;
import com.bookstore.service.OrderService;
import com.bookstore.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public PageResponse<Order> getAllOrders(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Order> orderPage = orderService
                .getAllOrders(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @GetMapping("/user/{userId}")
    public PageResponse<Order> getOrdersByUserId(
            @PathVariable @NonNull Long userId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Order> orderPage = orderService.getOrdersByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @GetMapping("/my")
    public PageResponse<Order> getMyOrders(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Order> orderPage = orderService.getOrdersByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable @NonNull Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody @NonNull OrderCreateRequest request) {
        try {
            return ResponseEntity.ok(orderService.createOrderFromRequest(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable @NonNull Long id, @RequestParam @NonNull String status) {
        try {
            OrderStatus orderStatus = OrderStatus.fromString(status);
            Long currentUserId = SecurityUtils.getCurrentUserId();
            boolean isAdmin = SecurityUtils.isAdmin();
            
            // 允许用户支付自己的订单，或者管理员修改任何订单状态
            if (!isAdmin) {
                boolean isOwner = orderService.isOrderOwnedByUser(id, currentUserId);
                if (!isOwner) {
                    return ResponseEntity.status(403).body("无权修改他人订单状态");
                }
                // 普通用户只能将订单改为已支付状态
                if (orderStatus != OrderStatus.PAID) {
                    return ResponseEntity.status(403).body("无权执行此操作");
                }
            }
            
            return ResponseEntity.ok(orderService.updateOrderStatus(id, orderStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable @NonNull Long id) {
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            boolean isAdmin = SecurityUtils.isAdmin();

            if (!isAdmin && !orderService.isOrderOwnedByUser(id, currentUserId)) {
                return ResponseEntity.status(403).body("无权删除他人订单");
            }

            orderService.deleteOrder(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("删除订单失败: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable @NonNull Long id, @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            boolean isAdmin = SecurityUtils.isAdmin();

            // 检查权限
            if (!isAdmin && !orderService.isOrderOwnedByUser(id, currentUserId)) {
                return ResponseEntity.status(403).body("无权取消他人订单");
            }

            String cancelReason = requestBody != null ? requestBody.get("reason") : null;
            Order cancelledOrder = orderService.cancelOrder(id, cancelReason);
            return ResponseEntity.ok(cancelledOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/batch/status")
    public ResponseEntity<?> batchUpdateOrderStatus(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<Number> orderIds = (java.util.List<Number>) request.get("orderIds");
            String status = (String) request.get("status");
            
            if (orderIds == null || orderIds.isEmpty()) {
                return ResponseEntity.badRequest().body("请选择订单");
            }
            if (status == null || status.isEmpty()) {
                return ResponseEntity.badRequest().body("请选择状态");
            }
            
            OrderStatus orderStatus = OrderStatus.fromString(status);
            int updatedCount = orderService.batchUpdateOrderStatus(orderIds, orderStatus);
            
            return ResponseEntity.ok(Map.of(
                "message", "批量更新成功",
                "count", updatedCount
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

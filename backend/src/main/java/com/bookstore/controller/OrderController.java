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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@Tag(name = "订单", description = "订单创建和管理接口")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Operation(summary = "获取所有订单", description = "分页获取所有订单（管理员）")
    @GetMapping
    public PageResponse<Order> getAllOrders(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Order> orderPage = orderService
                .getAllOrders(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @Operation(summary = "获取用户订单", description = "根据用户 ID 获取订单列表")
    @GetMapping("/user/{userId}")
    public PageResponse<Order> getOrdersByUserId(
            @PathVariable @NonNull Long userId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Order> orderPage = orderService.getOrdersByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @Operation(summary = "获取我的订单", description = "获取当前登录用户的订单列表")
    @GetMapping("/my")
    public PageResponse<Order> getMyOrders(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Order> orderPage = orderService.getOrdersByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @Operation(summary = "获取订单详情", description = "根据 ID 获取单个订单信息")
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable @NonNull Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "创建订单", description = "从购物车创建新订单")
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody @NonNull OrderCreateRequest request) {
        try {
            return ResponseEntity.ok(orderService.createOrderFromRequest(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "更新订单状态", description = "修改订单状态（支付/发货/完成）")
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
                // 普通用户只能将订单改为已支付或已完成状态
                if (orderStatus != OrderStatus.PAID && orderStatus != OrderStatus.COMPLETED) {
                    return ResponseEntity.status(403).body("无权执行此操作");
                }
            }
            
            return ResponseEntity.ok(orderService.updateOrderStatus(id, orderStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "删除订单", description = "删除订单记录")
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

    @Operation(summary = "取消订单", description = "取消未完成的订单")
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

    @Operation(summary = "批量更新订单状态", description = "批量修改多个订单的状态")
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

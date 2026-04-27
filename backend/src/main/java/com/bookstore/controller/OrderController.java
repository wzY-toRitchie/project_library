package com.bookstore.controller;

import com.bookstore.entity.Order;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.payload.request.OrderCreateRequest;
import com.bookstore.payload.response.PageResponse;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "订单", description = "订单创建和管理接口")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Operation(summary = "获取所有订单", description = "分页获取所有订单列表（管理员）")
    @GetMapping
    public PageResponse<Order> getAllOrders(
            @Parameter(description = "页码，从 0 开始") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "每页数量") @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Order> orderPage = orderService
                .getAllOrders(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @Operation(summary = "获取用户订单", description = "根据用户 ID 分页获取订单列表")
    @GetMapping("/user/{userId}")
    public PageResponse<Order> getOrdersByUserId(
            @Parameter(description = "用户 ID") @PathVariable Long userId,
            @Parameter(description = "页码，从 0 开始") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "每页数量") @RequestParam(required = false, defaultValue = "10") int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin() && !currentUserId.equals(userId)) {
            throw new ForbiddenException("无权查看其他用户订单");
        }

        Page<Order> orderPage = orderService.getOrdersByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @Operation(summary = "获取我的订单", description = "获取当前登录用户的订单列表")
    @GetMapping("/my")
    public PageResponse<Order> getMyOrders(
            @Parameter(description = "页码，从 0 开始") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "每页数量") @RequestParam(required = false, defaultValue = "10") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Order> orderPage = orderService.getOrdersByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime")));
        return new PageResponse<>(orderPage.getContent(), page, size, orderPage.getTotalElements());
    }

    @Operation(summary = "获取订单详情", description = "根据订单 ID 获取单条订单信息")
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @Parameter(description = "订单 ID") @PathVariable Long id) {
        Order order = orderService.getOrderById(id);

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin() && (order.getUser() == null || !currentUserId.equals(order.getUser().getId()))) {
            throw new ForbiddenException("无权查看他人订单");
        }
        return ResponseEntity.ok(order);
    }

    @Operation(summary = "创建订单", description = "根据请求中的商品列表创建新订单，自动扣减库存并计算总价")
    @PostMapping
    public ResponseEntity<?> createOrder(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "订单创建请求", required = true) @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromRequest(request));
    }

    @Operation(summary = "更新订单状态", description = "修改订单状态，支持支付、发货、完成等操作。普通用户只能将自己的订单改为已支付或已完成，管理员可以修改任何订单")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @Parameter(description = "订单 ID") @PathVariable Long id,
            @Parameter(description = "目标状态：PENDING/PAID/SHIPPED/COMPLETED/CANCELLED", required = true)
            @RequestParam String status) {
        OrderStatus orderStatus = OrderStatus.fromString(status);
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();

        if (!isAdmin) {
            boolean isOwner = orderService.isOrderOwnedByUser(id, currentUserId);
            if (!isOwner) {
                return ResponseEntity.status(403).body("无权修改他人订单状态");
            }
            if (orderStatus != OrderStatus.COMPLETED) {
                return ResponseEntity.status(403).body("无权执行此操作");
            }
        }

        return ResponseEntity.ok(orderService.updateOrderStatus(id, orderStatus));
    }

    @Operation(summary = "删除订单", description = "删除指定订单记录，普通用户只能删除自己的订单")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(
            @Parameter(description = "订单 ID") @PathVariable Long id) {
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

    @Operation(summary = "取消订单", description = "取消状态为 PENDING 的订单，自动恢复库存")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @Parameter(description = "订单 ID") @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();

        if (!isAdmin && !orderService.isOrderOwnedByUser(id, currentUserId)) {
            return ResponseEntity.status(403).body("无权取消他人订单");
        }

        String cancelReason = requestBody != null ? requestBody.get("reason") : null;
        Order cancelledOrder = orderService.cancelOrder(id, cancelReason);
        return ResponseEntity.ok(cancelledOrder);
    }

    @PostMapping("/{id}/refund-request")
    public ResponseEntity<Order> requestRefund(
            @Parameter(description = "订单 ID") @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();
        String reason = requestBody != null ? requestBody.get("reason") : null;
        return ResponseEntity.ok(orderService.requestRefund(id, currentUserId, isAdmin, reason));
    }

    @PostMapping("/{id}/refund-reject")
    public ResponseEntity<Order> rejectRefund(
            @Parameter(description = "订单 ID") @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("无权处理退款申请");
        }

        String reason = requestBody != null ? requestBody.get("reason") : null;
        return ResponseEntity.ok(orderService.rejectRefund(id, reason));
    }

    @Operation(summary = "批量更新订单状态", description = "批量修改多个订单的状态（管理员）")
    @PostMapping("/batch/status")
    public ResponseEntity<?> batchUpdateOrderStatus(@RequestBody Map<String, Object> request) {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("无权批量更新订单状态");
        }

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

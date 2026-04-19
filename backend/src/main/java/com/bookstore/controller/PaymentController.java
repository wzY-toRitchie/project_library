package com.bookstore.controller;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.SecurityUtils;
import com.bookstore.service.AlipayService;
import com.bookstore.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "支付", description = "支付宝支付接口")
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private AlipayService alipayService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PaymentController.class);

    @Operation(summary = "创建支付宝支付", description = "为订单创建支付宝支付链接")
    @PostMapping("/create/{orderId}")
    public ResponseEntity<Map<String, String>> createPayment(
            @Parameter(description = "订单 ID") @PathVariable Long orderId) {
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));

            if (!order.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "无权操作此订单"));
            }

            if (order.getStatus() != OrderStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of("error", "订单状态不允许支付"));
            }

            String paymentHtml = alipayService.createPayment(order);

            Map<String, String> result = new HashMap<>();
            result.put("paymentHtml", paymentHtml);
            result.put("orderId", orderId.toString());

            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("创建支付失败", e);
            return ResponseEntity.status(500).body(Map.of("error", "支付创建失败"));
        }
    }

    @Operation(summary = "查询支付状态", description = "查询订单的支付状态")
    @GetMapping("/status/{orderId}")
    public ResponseEntity<Map<String, String>> getPaymentStatus(
            @Parameter(description = "订单 ID") @PathVariable Long orderId) {
        ResponseEntity<Map<String, String>> forbidden = validateOrderAccess(orderId);
        if (forbidden != null) {
            return forbidden;
        }

        try {
            String status = alipayService.queryOrder(orderId);

            if (status == null) {
                return ResponseEntity.ok(Map.of("status", "UNKNOWN", "message", "未找到支付记录"));
            }

            Map<String, String> result = new HashMap<>();
            result.put("status", status);
            result.put("orderId", orderId.toString());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("查询支付状态失败", e);
            return ResponseEntity.status(500).body(Map.of("error", "查询支付状态失败"));
        }
    }

    @Operation(summary = "异步通知回调", description = "支付宝异步通知回调地址")
    @PostMapping("/notify")
    public ResponseEntity<String> handleNotify(@RequestParam Map<String, String> params) {
        try {
            if (!alipayService.verifyNotify(params)) {
                logger.error("Alipay notify signature verification failed");
                return ResponseEntity.badRequest().body("fail");
            }

            alipayService.handleNotify(params);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            logger.error("Error processing Alipay notify", e);
            return ResponseEntity.badRequest().body("fail");
        }
    }

    @Operation(summary = "关闭订单", description = "关闭未支付的订单")
    @PostMapping("/close/{orderId}")
    public ResponseEntity<Map<String, Object>> closeOrder(
            @Parameter(description = "订单 ID") @PathVariable Long orderId) {
        ResponseEntity<Map<String, Object>> forbidden = validateOrderObjectAccess(orderId);
        if (forbidden != null) {
            return forbidden;
        }

        try {
            boolean success = alipayService.closeOrder(orderId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("orderId", orderId);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("关闭订单失败", e);
            return ResponseEntity.status(500).body(Map.of("error", "关闭订单失败", "success", false));
        }
    }

    @Operation(summary = "退款", description = "退款给用户")
    @PostMapping("/refund/{orderId}")
    public ResponseEntity<Map<String, Object>> refund(
            @Parameter(description = "订单 ID") @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "0") String amount) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "无权操作此订单", "success", false));
        }

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));

            BigDecimal refundAmount = parseRefundAmount(amount, order.getTotalPrice());
            boolean success = alipayService.refund(orderId, refundAmount);

            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("orderId", orderId);
            result.put("refundAmount", refundAmount);

            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("退款失败", e);
            return ResponseEntity.status(500).body(Map.of("error", "退款处理失败", "success", false));
        }
    }

    private BigDecimal parseRefundAmount(String amount, BigDecimal totalPrice) {
        if (amount == null || amount.isEmpty() || "0".equals(amount)) {
            return totalPrice;
        }

        try {
            return new BigDecimal(amount);
        } catch (NumberFormatException e) {
            throw new BadRequestException("退款金额格式无效");
        }
    }


    private ResponseEntity<Map<String, String>> validateOrderAccess(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));
        if (!SecurityUtils.isAdmin() && !orderService.isOrderOwnedByUser(orderId, SecurityUtils.getCurrentUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "无权操作此订单"));
        }
        return null;
    }

    private ResponseEntity<Map<String, Object>> validateOrderObjectAccess(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));
        if (!SecurityUtils.isAdmin() && !orderService.isOrderOwnedByUser(orderId, SecurityUtils.getCurrentUserId())) {
            return ResponseEntity.status(403).body(Map.of("error", "无权操作此订单"));
        }
        return null;
    }
}

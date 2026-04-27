package com.bookstore.controller;

import com.bookstore.config.AlipayConfig;
import com.bookstore.entity.Order;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.ResourceNotFoundException;
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
    private AlipayConfig alipayConfig;

    @Autowired
    private OrderService orderService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PaymentController.class);

    @Operation(summary = "创建支付宝支付", description = "为订单创建支付宝支付链接")
    @PostMapping("/create/{orderId}")
    public ResponseEntity<Map<String, String>> createPayment(
            @Parameter(description = "订单 ID") @PathVariable Long orderId) {
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            Order order = orderService.getOrderForAccess(orderId, currentUserId, false);

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
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            boolean isAdmin = SecurityUtils.isAdmin();
            orderService.getOrderForAccess(orderId, currentUserId, isAdmin);
            String status = alipayService.queryOrder(orderId);

            if (status == null) {
                return ResponseEntity.ok(Map.of("status", "UNKNOWN", "message", "未找到支付记录"));
            }

            Map<String, String> result = new HashMap<>();
            result.put("status", status);
            result.put("orderId", orderId.toString());

            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException | ForbiddenException e) {
            throw e;
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
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            boolean isAdmin = SecurityUtils.isAdmin();
            Order order = orderService.getOrderForAccess(orderId, currentUserId, isAdmin);
            boolean success = alipayService.closeOrder(orderId);

            if (success) {
                orderService.cancelOrder(orderId, "支付宝关闭订单");
                order = orderService.getOrderById(orderId);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("orderId", orderId);
            result.put("status", order.getStatus());

            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException | ForbiddenException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("关闭订单失败", e);
            return ResponseEntity.status(500).body(Map.of("error", "关闭订单失败", "success", false));
        }
    }

    @Operation(summary = "退款", description = "退款给用户")
    @GetMapping("/alipay-sandbox")
    public ResponseEntity<Map<String, Object>> getAlipaySandboxStatus() {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("无权查看支付宝沙箱配置");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("sandbox", alipayConfig.isSandbox());
        result.put("gateway", alipayConfig.getGateway());
        result.put("returnUrl", alipayConfig.getReturnUrl());
        result.put("notifyUrl", alipayConfig.getNotifyUrl());
        result.put("signType", alipayConfig.getSignType());
        result.put("mockEnabled", alipayService.isSandboxMockEnabled());
        result.put("effectiveMockMode", alipayService.shouldMockGateway());
        result.put("gatewayConfigured", alipayService.isGatewayConfigured());
        result.put("appIdConfigured", alipayService.isAppIdConfigured());
        result.put("privateKeyConfigured", alipayService.isPrivateKeyConfigured());
        result.put("alipayPublicKeyConfigured", alipayService.isAlipayPublicKeyConfigured());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/alipay-sandbox/mock")
    public ResponseEntity<Map<String, Object>> updateAlipaySandboxMock(@RequestBody Map<String, Object> request) {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("无权修改支付宝沙箱配置");
        }

        Object enabledValue = request.get("enabled");
        if (!(enabledValue instanceof Boolean enabled)) {
            throw new BadRequestException("enabled 必须是布尔值");
        }

        alipayService.setSandboxMockEnabled(enabled);
        return getAlipaySandboxStatus();
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<Map<String, Object>> refund(
            @Parameter(description = "订单 ID") @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "0") String amount) {
        if (!SecurityUtils.isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "无权操作此订单", "success", false));
        }

        try {
            Order order = orderService.getOrderById(orderId);
            if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
                throw new BadRequestException("当前订单状态不支持退款");
            }

            BigDecimal refundAmount = parseRefundAmount(amount, order.getTotalPrice());
            boolean success = alipayService.refund(orderId, refundAmount);
            if (success) {
                Order refundedOrder = orderService.markOrderRefunded(orderId, refundAmount);
                if (refundedOrder != null) {
                    order = refundedOrder;
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("orderId", orderId);
            result.put("refundAmount", refundAmount);
            result.put("status", order.getStatus());

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
            BigDecimal refundAmount = new BigDecimal(amount);
            if (refundAmount.compareTo(BigDecimal.ZERO) <= 0 || refundAmount.compareTo(totalPrice) > 0) {
                throw new BadRequestException("退款金额必须大于0且不能超过订单金额");
            }
            return refundAmount;
        } catch (NumberFormatException e) {
            throw new BadRequestException("退款金额格式无效");
        }
    }
}

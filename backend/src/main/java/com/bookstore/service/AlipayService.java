package com.bookstore.service;

import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.AlipayTradePagePayModel;
import com.alipay.api.domain.AlipayTradeQueryModel;
import com.alipay.api.domain.AlipayTradeRefundModel;
import com.alipay.api.domain.AlipayTradeCloseModel;
import com.alipay.api.internal.util.AlipaySignature;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.request.AlipayTradeRefundRequest;
import com.alipay.api.request.AlipayTradeCloseRequest;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.alipay.api.response.AlipayTradeRefundResponse;
import com.alipay.api.response.AlipayTradeCloseResponse;
import com.bookstore.config.AlipayConfig;
import com.bookstore.entity.Order;
import com.bookstore.enums.OrderStatus;
import com.bookstore.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AlipayService {

    private static final Logger logger = LoggerFactory.getLogger(AlipayService.class);

    @Autowired
    private AlipayConfig alipayConfig;

    @Autowired
    private OrderRepository orderRepository;

    private AlipayClient alipayClient;
    private volatile boolean sandboxMockEnabled = true;

    @PostConstruct
    public void init() {
        alipayClient = new DefaultAlipayClient(
                alipayConfig.getGateway(),
                alipayConfig.getAppId(),
                alipayConfig.getPrivateKey(),
                "JSON",
                "UTF-8",
                alipayConfig.getAlipayPublicKey(),
                alipayConfig.getSignType()
        );
        logger.info("AlipayClient initialized with gateway: {}", alipayConfig.getGateway());
    }

    /**
     * 创建支付订单，返回 HTML 表单
     */
    public String createPayment(Order order) throws AlipayApiException {
        if (shouldMockGateway()) {
            order.setPaymentMethod("MOCK_ALIPAY");
            orderRepository.save(order);
            logger.warn("Alipay sandbox mock payment form generated for order {}", order.getId());
            return """
                    <form action="%s" method="GET">
                        <input type="hidden" name="out_trade_no" value="%s" />
                    </form>
                    """.formatted(alipayConfig.getReturnUrl(), order.getId());
        }

        AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
        request.setReturnUrl(alipayConfig.getReturnUrl());
        request.setNotifyUrl(alipayConfig.getNotifyUrl());

        AlipayTradePagePayModel model = new AlipayTradePagePayModel();
        model.setOutTradeNo(order.getId().toString());
        model.setTotalAmount(order.getTotalPrice().setScale(2, RoundingMode.HALF_UP).toString());
        model.setSubject("线上书店订单-" + order.getId());
        model.setBody("订单包含 " + order.getItems().size() + " 本图书");
        model.setProductCode("FAST_INSTANT_TRADE_PAY");

        request.setBizModel(model);

        // 使用 SDK 生成支付表单
        String formHtml = alipayClient.pageExecute(request, "POST").getBody();
        logger.info("Payment form generated for order: {}", order.getId());

        // 更新订单支付方式
        order.setPaymentMethod("ALIPAY");
        orderRepository.save(order);

        return formHtml;
    }

    /**
     * 查询订单支付状态
     */
    public String queryOrder(Long orderId) throws AlipayApiException {
        if (shouldMockGateway()) {
            orderRepository.findById(orderId).ifPresent(order -> {
                if (order.getStatus() == OrderStatus.PENDING) {
                    order.setStatus(OrderStatus.PAID);
                    order.setPaymentMethod("MOCK_ALIPAY");
                    order.setPaymentTime(LocalDateTime.now());
                    orderRepository.save(order);
                }
            });
            logger.warn("Alipay sandbox mock query returns TRADE_SUCCESS for order {}", orderId);
            return "TRADE_SUCCESS";
        }

        AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
        AlipayTradeQueryModel model = new AlipayTradeQueryModel();
        model.setOutTradeNo(orderId.toString());
        request.setBizModel(model);

        AlipayTradeQueryResponse response = alipayClient.execute(request);
        logger.info("Query order response: {}", response.getBody());

        if (response.isSuccess()) {
            return response.getTradeStatus();
        }
        logger.error("Query order failed: {} - {}", response.getCode(), response.getMsg());
        return null;
    }

    /**
     * 关闭订单
     */
    public boolean closeOrder(Long orderId) throws AlipayApiException {
        if (shouldMockGateway()) {
            logger.warn("Alipay sandbox mock close succeeds for order {}", orderId);
            return true;
        }

        AlipayTradeCloseRequest request = new AlipayTradeCloseRequest();
        AlipayTradeCloseModel model = new AlipayTradeCloseModel();
        model.setOutTradeNo(orderId.toString());
        request.setBizModel(model);

        AlipayTradeCloseResponse response = alipayClient.execute(request);
        logger.info("Close order response: {}", response.getBody());

        return response.isSuccess();
    }

    /**
     * 退款
     */
    public boolean refund(Long orderId, BigDecimal refundAmount) throws AlipayApiException {
        if (shouldMockGateway()) {
            logger.warn("Alipay sandbox credentials are not configured; mock refund succeeds for order {}", orderId);
            return true;
        }

        AlipayTradeRefundRequest request = new AlipayTradeRefundRequest();
        AlipayTradeRefundModel model = new AlipayTradeRefundModel();
        model.setOutTradeNo(orderId.toString());
        model.setRefundAmount(refundAmount.setScale(2, RoundingMode.HALF_UP).toString());
        model.setRefundReason("用户取消订单");
        request.setBizModel(model);

        AlipayTradeRefundResponse response = alipayClient.execute(request);
        logger.info("Refund response: {}", response.getBody());

        return response.isSuccess();
    }

    public boolean shouldMockGateway() {
        return alipayConfig.isSandbox() && sandboxMockEnabled;
    }

    public boolean isSandboxMockEnabled() {
        return sandboxMockEnabled;
    }

    public void setSandboxMockEnabled(boolean sandboxMockEnabled) {
        this.sandboxMockEnabled = sandboxMockEnabled;
    }

    public boolean isGatewayConfigured() {
        return hasText(alipayConfig.getAppId())
                && hasText(alipayConfig.getPrivateKey())
                && hasText(alipayConfig.getAlipayPublicKey());
    }

    public boolean isAppIdConfigured() {
        return hasText(alipayConfig.getAppId());
    }

    public boolean isPrivateKeyConfigured() {
        return hasText(alipayConfig.getPrivateKey());
    }

    public boolean isAlipayPublicKeyConfigured() {
        return hasText(alipayConfig.getAlipayPublicKey());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    /**
     * 验证异步通知签名
     */
    public boolean verifyNotify(Map<String, String> params) {
        try {
            // 使用 SDK 的验签方法
            boolean signVerified = AlipaySignature.rsaCheckV1(
                    params,
                    alipayConfig.getAlipayPublicKey(),
                    "UTF-8",
                    alipayConfig.getSignType()
            );
            logger.info("Notify signature verification: {}", signVerified);
            return signVerified;
        } catch (AlipayApiException e) {
            logger.error("Signature verification failed", e);
            return false;
        }
    }

    /**
     * 处理异步通知
     */
    public void handleNotify(Map<String, String> params) {
        try {
            String outTradeNo = params.get("out_trade_no");
            String tradeStatus = params.get("trade_status");
            String tradeNo = params.get("trade_no");
            String appId = params.get("app_id");
            String totalAmount = params.get("total_amount");

            logger.info("Received Alipay notify: outTradeNo={}, tradeStatus={}, tradeNo={}", outTradeNo, tradeStatus, tradeNo);

            // 验证 app_id
            if (appId != null && !appId.equals(alipayConfig.getAppId())) {
                logger.error("Invalid app_id: {}, expected: {}", appId, alipayConfig.getAppId());
                return;
            }

            Long orderId = Long.parseLong(outTradeNo);
            Order order = orderRepository.findById(orderId).orElse(null);

            if (order == null) {
                logger.error("Order not found: {}", orderId);
                return;
            }

            // 验证金额
            if (totalAmount != null) {
                BigDecimal notifyAmount = new BigDecimal(totalAmount);
                BigDecimal orderAmount = order.getTotalPrice().setScale(2, RoundingMode.HALF_UP);
                if (notifyAmount.compareTo(orderAmount) != 0) {
                    logger.error("Amount mismatch: notify={}, order={}", notifyAmount, orderAmount);
                    return;
                }
            }

            // 防止重复处理
            if (order.getStatus() == OrderStatus.PAID) {
                logger.info("Order {} already paid, skipping", orderId);
                return;
            }

            if (order.getStatus() != OrderStatus.PENDING) {
                logger.warn("Ignore paid notify for order {} with local status {}", orderId, order.getStatus());
                return;
            }

            if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
                order.setStatus(OrderStatus.PAID);
                order.setPaymentMethod("ALIPAY");
                order.setPaymentTime(LocalDateTime.now());
                orderRepository.save(order);
                logger.info("Order {} paid successfully via Alipay", orderId);
            }
        } catch (Exception e) {
            logger.error("Error processing Alipay notify", e);
        }
    }
}

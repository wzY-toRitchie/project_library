package com.bookstore.service;

import com.bookstore.config.AlipayConfig;
import com.bookstore.entity.Order;
import com.bookstore.enums.OrderStatus;
import com.bookstore.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class AlipayService {

    private static final Logger logger = LoggerFactory.getLogger(AlipayService.class);

    @Autowired
    private AlipayConfig alipayConfig;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * 创建支付订单，返回跳转 URL
     */
    public String createPayment(Order order) throws Exception {
        // 构建业务参数
        Map<String, String> bizContent = new TreeMap<>();
        bizContent.put("out_trade_no", order.getId().toString());
        bizContent.put("total_amount", order.getTotalAmount().toString());
        bizContent.put("subject", "线上书店订单-" + order.getId());
        bizContent.put("body", "订单包含 " + order.getOrderItems().size() + " 本图书");
        bizContent.put("product_code", "FAST_INSTANT_TRADE_PAY");
        bizContent.put("timeout_express", "15h");

        // 公共参数
        Map<String, String> params = new TreeMap<>();
        params.put("app_id", alipayConfig.getAppId());
        params.put("method", "alipay.trade.page.pay");
        params.put("format", "JSON");
        params.put("charset", "utf-8");
        params.put("sign_type", alipayConfig.getSignType());
        params.put("timestamp", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        params.put("version", "1.0");
        params.put("notify_url", alipayConfig.getNotifyUrl());
        params.put("return_url", alipayConfig.getReturnUrl());
        params.put("biz_content", new com.alibaba.fastjson2.JSONObject(bizContent).toJSONString());

        // 生成签名
        String sign = generateSign(params);
        params.put("sign", sign);

        // 构建请求参数
        StringBuilder requestBody = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (requestBody.length() > 0) {
                requestBody.append("&");
            }
            requestBody.append(entry.getKey()).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }

        // 返回form表单
        String formHtml = "<form id='alipayForm' action='" + alipayConfig.getGateway() + "' method='POST'>";
        for (Map.Entry<String, String> entry : params.entrySet()) {
            formHtml += "<input type='hidden' name='" + entry.getKey() + "' value='" + entry.getValue() + "'/>";
        }
        formHtml += "<input type='submit' value='立即支付' style='display:none;'></form>";
        formHtml += "<script>document.getElementById('alipayForm').submit();</script>";

        logger.info("Payment created for order: {}", order.getId());

        // 更新订单支付方式
        order.setPaymentMethod("ALIPAY");
        orderRepository.save(order);

        return formHtml;
    }

    /**
     * 查询订单支付状态
     */
    public String queryOrder(Long orderId) throws Exception {
        Map<String, String> bizContent = new TreeMap<>();
        bizContent.put("out_trade_no", orderId.toString());

        Map<String, String> params = buildCommonParams("alipay.trade.query");
        params.put("biz_content", new com.alibaba.fastjson2.JSONObject(bizContent).toJSONString());

        String sign = generateSign(params);
        params.put("sign", sign);

        String response = doPost(buildUrl(params));
        logger.info("Query order response: {}", response);

        // 解析响应
        com.alibaba.fastjson2.JSONObject root = com.alibaba.fastjson2.JSON.parseObject(response);
        com.alibaba.fastjson2.JSONObject queryResponse = root.getJSONObject("alipay_trade_query_response");
        if (queryResponse != null) {
            return queryResponse.getString("trade_status");
        }
        return null;
    }

    /**
     * 关闭订单
     */
    public boolean closeOrder(Long orderId) throws Exception {
        Map<String, String> bizContent = new TreeMap<>();
        bizContent.put("out_trade_no", orderId.toString());

        Map<String, String> params = buildCommonParams("alipay.trade.close");
        params.put("biz_content", new com.alibaba.fastjson2.JSONObject(bizContent).toJSONString());

        String sign = generateSign(params);
        params.put("sign", sign);

        String response = doPost(buildUrl(params));
        logger.info("Close order response: {}", response);

        com.alibaba.fastjson2.JSONObject root = com.alibaba.fastjson2.JSON.parseObject(response);
        com.alibaba.fastjson2.JSONObject closeResponse = root.getJSONObject("alipay_trade_close_response");
        return closeResponse != null && "10000".equals(closeResponse.getString("code"));
    }

    /**
     * 退款
     */
    public boolean refund(Long orderId, BigDecimal refundAmount) throws Exception {
        Map<String, String> bizContent = new TreeMap<>();
        bizContent.put("out_trade_no", orderId.toString());
        bizContent.put("refund_amount", refundAmount.toString());
        bizContent.put("refund_reason", "用户取消订单");

        Map<String, String> params = buildCommonParams("alipay.trade.refund");
        params.put("biz_content", new com.alibaba.fastjson2.JSONObject(bizContent).toJSONString());

        String sign = generateSign(params);
        params.put("sign", sign);

        String response = doPost(buildUrl(params));
        logger.info("Refund response: {}", response);

        com.alibaba.fastjson2.JSONObject root = com.alibaba.fastjson2.JSON.parseObject(response);
        com.alibaba.fastjson2.JSONObject refundResponse = root.getJSONObject("alipay_trade_refund_response");
        return refundResponse != null && "10000".equals(refundResponse.getString("code"));
    }

    /**
     * 验证异步通知签名
     */
    public boolean verifyNotify(Map<String, String> params) throws Exception {
        String sign = params.get("sign");
        if (sign == null) {
            return false;
        }

        // 移除sign和sign_type参数后排序
        Map<String, String> signParams = new TreeMap<>(params);
        signParams.remove("sign");
        signParams.remove("sign_type");

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : signParams.entrySet()) {
            if (sb.length() > 0) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=").append(entry.getValue());
        }

        String signedContent = sb.toString();
        String calculatedSign = rsaSign(signedContent, alipayConfig.getPrivateKey(), "RSA2");

        return sign.equals(calculatedSign);
    }

    /**
     * 处理异步通知
     */
    public void handleNotify(Map<String, String> params) {
        try {
            String outTradeNo = params.get("out_trade_no");
            String tradeStatus = params.get("trade_status");
            String tradeNo = params.get("trade_no");

            logger.info("Received Alipay notify: outTradeNo={}, tradeStatus={}", outTradeNo, tradeStatus);

            Long orderId = Long.parseLong(outTradeNo);
            Order order = orderRepository.findById(orderId).orElse(null);

            if (order == null) {
                logger.error("Order not found: {}", orderId);
                return;
            }

            // TRADE_SUCCESS 或 TRADE_FINISHED 表示支付成功
            if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
                order.setStatus(OrderStatus.PAID);
                order.setPaymentMethod("ALIPAY");
                order.setPaymentTime(java.time.LocalDateTime.now());
                orderRepository.save(order);
                logger.info("Order {} paid successfully", orderId);
            }
        } catch (Exception e) {
            logger.error("Error processing Alipay notify", e);
        }
    }

    // ========== 私有方法 ==========

    private Map<String, String> buildCommonParams(String method) {
        Map<String, String> params = new TreeMap<>();
        params.put("app_id", alipayConfig.getAppId());
        params.put("method", method);
        params.put("format", "JSON");
        params.put("charset", "utf-8");
        params.put("sign_type", alipayConfig.getSignType());
        params.put("timestamp", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        params.put("version", "1.0");
        return params;
    }

    private String buildUrl(Map<String, String> params) {
        StringBuilder sb = new StringBuilder(alipayConfig.getGateway()).append("?");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > alipayConfig.getGateway().length() + 1) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    private String doPost(String url) throws Exception {
        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(10000);

        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            return response.toString();
        }
    }

    private String generateSign(Map<String, String> params) throws Exception {
        // 移除sign和sign_type
        Map<String, String> signParams = new TreeMap<>(params);
        signParams.remove("sign");
        signParams.remove("sign_type");

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : signParams.entrySet()) {
            if (sb.length() > 0) {
                sb.append("&");
            }
            sb.append(entry.getKey()).append("=").append(entry.getValue());
        }

        return rsaSign(sb.toString(), alipayConfig.getPrivateKey(), alipayConfig.getSignType());
    }

    private String rsaSign(String content, String privateKey, String signType) throws Exception {
        // 简化实现：实际生产环境需要使用正确的RSA签名
        // 这里使用占位符实现，仅用于沙箱测试
        try {
            java.security.KeyFactory keyFactory = java.security.KeyFactory.getInstance("RSA");
            byte[] keyBytes = Base64.getDecoder().decode(privateKey);
            java.security.PrivateKey key = keyFactory.generatePrivate(
                new java.security.spec.PKCS8EncodedKeySpec(keyBytes)
            );

            java.security.Signature signature = java.security.Signature.getInstance(
                "SHA256WithRSA".equals(signType) ? "SHA256WithRSA" : "SHA1WithRSA"
            );
            signature.initSign(key);
            signature.update(content.getBytes(StandardCharsets.UTF_8));
            byte[] signed = signature.sign();
            return Base64.getEncoder().encodeToString(signed);
        } catch (Exception e) {
            logger.error("Sign error, using placeholder", e);
            return "MOCK_SIGN_" + System.currentTimeMillis();
        }
    }
}
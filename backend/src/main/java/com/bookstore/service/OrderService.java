package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.Notification;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.OrderCreateRequest;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SystemSettingService systemSettingService;

    @Autowired
    private CouponService couponService;

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public Page<Order> getOrdersByUserId(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));
    }

    public Order getOrderForAccess(@NonNull Long orderId, @NonNull Long userId, boolean isAdmin) {
        Order order = getOrderById(orderId);
        if (!isAdmin && (order.getUser() == null || !userId.equals(order.getUser().getId()))) {
            throw new ForbiddenException("无权操作此订单");
        }
        return order;
    }

    @Transactional
    public Order createOrder(Order order) {
        // 设置订单用户
        if (order.getUser() == null) {
            Long userId = SecurityUtils.getCurrentUserId();
            com.bookstore.entity.User user = new com.bookstore.entity.User();
            user.setId(userId);
            order.setUser(user);
        }

        Integer lowStockThreshold = 10;
        try {
            Integer configuredThreshold = systemSettingService.getSettings().getLowStockThreshold();
            if (configuredThreshold != null) {
                lowStockThreshold = configuredThreshold;
            }
        } catch (Exception e) {
            logger.warn("读取库存预警阈值失败", e);
        }

        if (order.getItems() != null) {
            BigDecimal totalPrice = BigDecimal.ZERO;
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);

                if (item.getBook() == null || item.getBook().getId() == null) {
                    throw new RuntimeException("图书信息不完整");
                }
                Long bookId = item.getBook().getId();
                Book book = bookRepository.findById(Objects.requireNonNull(bookId))
                        .orElseThrow(() -> new RuntimeException("图书不存在"));

                // 原子扣减库存（防止并发超卖）
                int updated = bookRepository.decreaseStock(book.getId(), item.getQuantity());
                if (updated == 0) {
                    throw new RuntimeException("库存不足: " + book.getTitle() + " (剩余: " + book.getStock() + ")");
                }
                book.setStock(book.getStock() - item.getQuantity());

                // 计算总价
                totalPrice = totalPrice.add(book.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                item.setPrice(book.getPrice());

                // 库存预警
                try {
                    if (book.getStock() < lowStockThreshold) {
                        notificationRepository.save(new Notification("STOCK",
                                "库存预警: " + book.getTitle() + " (剩余: " + book.getStock() + ")"));
                    }
                } catch (Exception e) {
                    logger.warn("发送库存预警通知失败", e);
                }
            }
            order.setTotalPrice(totalPrice);
        }

        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.PENDING);
        }

        Order savedOrder = orderRepository.save(order);
        try {
            notificationRepository.save(new Notification("ORDER", "新订单: #" + savedOrder.getId()));
        } catch (Exception e) {
            logger.warn("发送订单通知失败", e);
        }
        return savedOrder;
    }

    @Transactional
    public Order createOrderFromRequest(OrderCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("订单项不能为空");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderCreateRequest.OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getBookId() == null) {
                throw new BadRequestException("图书ID不能为空");
            }

            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("图书不存在"));

            Integer quantity = itemRequest.getQuantity();
            if (quantity == null || quantity <= 0) {
                throw new BadRequestException("数量必须大于0");
            }

            // 原子扣减库存（防止并发超卖）
            int updated = bookRepository.decreaseStock(book.getId(), quantity);
            if (updated == 0) {
                throw new BadRequestException("库存不足: " + book.getTitle() + " (剩余: " + book.getStock() + ")");
            }
            // 刷新book对象以获取最新库存
            book = bookRepository.findById(book.getId()).orElse(book);

            // 计算总价
            totalPrice = totalPrice.add(book.getPrice().multiply(BigDecimal.valueOf(quantity)));

            // 创建订单项
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setBook(book);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(book.getPrice());
            orderItems.add(orderItem);

            // 库存预警
            try {
                Integer threshold = systemSettingService.getSettings().getLowStockThreshold();
                if (threshold == null) threshold = 10;

                if (book.getStock() < threshold) {
                    notificationRepository.save(new Notification("STOCK",
                            "库存预警: " + book.getTitle() + " (剩余: " + book.getStock() + ")"));
                }
            } catch (Exception e) {
                logger.warn("发送库存预警通知失败", e);
            }
        }

        order.setItems(orderItems);

        // Apply coupon discount if provided
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponId() != null) {
            try {
                discount = couponService.useCoupon(userId, request.getCouponId(), totalPrice, null);
            } catch (RuntimeException e) {
                throw new BadRequestException(e.getMessage());
            }
            totalPrice = totalPrice.subtract(discount);
            if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
                totalPrice = BigDecimal.ZERO;
            }
        }
        order.setTotalPrice(totalPrice);

        Order savedOrder = orderRepository.save(order);

        // 发送订单通知
        try {
            notificationRepository.save(new Notification("ORDER", "新订单: #" + savedOrder.getId()));
        } catch (Exception e) {
            logger.warn("发送订单通知失败", e);
        }

        return savedOrder;
    }

    public Order updateOrderStatus(@NonNull Long id, @NonNull OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));

        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new BadRequestException("非法订单状态流转: " + order.getStatus() + " -> " + status);
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Order requestRefund(@NonNull Long orderId, @NonNull Long userId, boolean isAdmin, String reason) {
        Order order = getOrderForAccess(orderId, userId, isAdmin);

        if (!canRequestRefund(order.getStatus())) {
            throw new BadRequestException("当前订单状态不支持申请退款");
        }

        order.setStatus(OrderStatus.REFUND_REQUESTED);
        order.setRefundReason(trimToNull(reason));
        order.setRefundRejectReason(null);
        order.setRefundRequestTime(LocalDateTime.now());
        order.setRefundProcessedTime(null);

        try {
            notificationRepository.save(new Notification("ORDER", "订单退款申请 #" + orderId));
        } catch (Exception e) {
            logger.warn("发送退款申请通知失败 orderId=" + orderId, e);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order rejectRefund(@NonNull Long orderId, String reason) {
        Order order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.REFUND_REQUESTED) {
            throw new BadRequestException("只有退款申请中的订单才能拒绝退款");
        }

        order.setStatus(OrderStatus.REFUND_REJECTED);
        order.setRefundRejectReason(trimToNull(reason));
        order.setRefundProcessedTime(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order markOrderRefunded(@NonNull Long orderId, @NonNull BigDecimal refundAmount) {
        Order order = getOrderById(orderId);

        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
            throw new BadRequestException("当前订单状态不支持退款");
        }

        restoreStock(order);
        order.setStatus(OrderStatus.REFUNDED);
        order.setRefundAmount(refundAmount);
        order.setRefundProcessedTime(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(@NonNull Long id) {
        orderRepository.deleteById(id);
    }

    public boolean isOrderOwnedByUser(@NonNull Long orderId, @NonNull Long userId) {
        return orderRepository.findById(orderId)
                .map(order -> order.getUser().getId().equals(userId))
                .orElse(false);
    }

    /**
     * 取消订单
     */
    @Transactional
    public Order cancelOrder(@NonNull Long orderId, String cancelReason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));

        // 检查订单状态
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("只有待支付状态的订单才能取消");
        }

        // 原子恢复库存
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Book book = item.getBook();
                if (book != null) {
                    bookRepository.increaseStock(book.getId(), item.getQuantity());
                }
            }
        }

        // 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(cancelReason);
        order.setCancelTime(java.time.LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // 发送通知
        try {
            notificationRepository.save(new Notification("ORDER", "订单已取消: #" + orderId));
        } catch (Exception e) {
            logger.warn("发送订单取消通知失败", e);
        }

        return savedOrder;
    }

    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return true;
        }
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.PAID || newStatus == OrderStatus.CANCELLED;
            case PAID -> newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.REFUND_REQUESTED;
            case SHIPPED -> newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.REFUND_REQUESTED;
            case COMPLETED -> newStatus == OrderStatus.REFUND_REQUESTED;
            case REFUND_REQUESTED -> newStatus == OrderStatus.REFUNDED || newStatus == OrderStatus.REFUND_REJECTED;
            case REFUND_REJECTED -> newStatus == OrderStatus.REFUND_REQUESTED;
            case CANCELLED, REFUNDED -> false;
        };
    }

    private boolean canRequestRefund(OrderStatus status) {
        return status == OrderStatus.PAID
                || status == OrderStatus.SHIPPED
                || status == OrderStatus.COMPLETED
                || status == OrderStatus.REFUND_REJECTED;
    }

    private void restoreStock(Order order) {
        if (order.getItems() == null) {
            return;
        }

        for (OrderItem item : order.getItems()) {
            Book book = item.getBook();
            if (book != null && book.getId() != null && item.getQuantity() != null) {
                bookRepository.increaseStock(book.getId(), item.getQuantity());
            }
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * 批量更新订单状态
     */
    @Transactional
    public int batchUpdateOrderStatus(List<? extends Number> orderIds, OrderStatus status) {
        int count = 0;
        for (Number orderId : orderIds) {
            try {
                updateOrderStatus(orderId.longValue(), status);
                count++;
            } catch (Exception e) {
                logger.warn("批量更新订单状态失败: orderId=" + orderId, e);
            }
        }
        return count;
    }
}

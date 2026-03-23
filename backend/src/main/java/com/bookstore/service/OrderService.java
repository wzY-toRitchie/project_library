package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.Notification;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
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

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Page<Order> getAllOrders(@NonNull Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public List<Order> getOrdersByUserId(@NonNull Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Page<Order> getOrdersByUserId(@NonNull Long userId, @NonNull Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    public Optional<Order> getOrderById(@NonNull Long id) {
        return orderRepository.findById(id);
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
                // 刷新book对象以获取最新库存
                book = bookRepository.findById(book.getId()).orElse(book);

                // 计算总价
                totalPrice = totalPrice.add(book.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                item.setPrice(book.getPrice());

                // 库存预警
                try {
                    Integer threshold = systemSettingService.getSettings().getLowStockThreshold();
                    if (threshold == null)
                        threshold = 10;

                    if (book.getStock() < threshold) {
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
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("订单项不能为空");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderCreateRequest.OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getBookId() == null) {
                throw new RuntimeException("图书ID不能为空");
            }

            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new RuntimeException("图书不存在: ID=" + itemRequest.getBookId()));

            Integer quantity = itemRequest.getQuantity();
            if (quantity == null || quantity <= 0) {
                throw new RuntimeException("数量必须大于0");
            }

            // 原子扣减库存（防止并发超卖）
            int updated = bookRepository.decreaseStock(book.getId(), quantity);
            if (updated == 0) {
                throw new RuntimeException("库存不足: " + book.getTitle() + " (剩余: " + book.getStock() + ")");
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
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("订单不存在"));
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
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        // 检查订单状态
        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("只有待支付状态的订单才能取消");
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

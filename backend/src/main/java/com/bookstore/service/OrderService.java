package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.Notification;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SystemSettingService systemSettingService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUserId(@NonNull Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Optional<Order> getOrderById(@NonNull Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order createOrder(Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);

                if (item.getBook() == null || item.getBook().getId() == null) {
                    throw new RuntimeException("Book not found");
                }
                Long bookId = item.getBook().getId();
                Book book = bookRepository.findById(Objects.requireNonNull(bookId))
                        .orElseThrow(() -> new RuntimeException("Book not found"));

                if (book.getStock() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for book: " + book.getTitle());
                }

                book.setStock(book.getStock() - item.getQuantity());
                bookRepository.save(book);

                try {
                    Integer threshold = systemSettingService.getSettings().getLowStockThreshold();
                    if (threshold == null)
                        threshold = 10;

                    if (book.getStock() < threshold) {
                        notificationRepository.save(new Notification("STOCK",
                                "库存预警: " + book.getTitle() + " (剩余: " + book.getStock() + ")"));
                    }
                } catch (Exception e) {
                    // Ignore notification errors
                    System.err.println("Failed to send stock notification: " + e.getMessage());
                }
            }
        }
        Order savedOrder = orderRepository.save(order);
        try {
            notificationRepository.save(new Notification("ORDER", "新订单: #" + savedOrder.getId()));
        } catch (Exception e) {
            System.err.println("Failed to send order notification: " + e.getMessage());
        }
        return savedOrder;
    }

    public Order updateOrderStatus(@NonNull Long id, @NonNull String status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public void deleteOrder(@NonNull Long id) {
        orderRepository.deleteById(id);
    }
}

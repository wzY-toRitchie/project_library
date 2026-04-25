package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Notification;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.SystemSetting;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.payload.request.OrderCreateRequest;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.services.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SystemSettingService systemSettingService;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private OrderService orderService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateOrderStatusRejectsIllegalTransition() {
        Order order = order(OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, OrderStatus.COMPLETED))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("非法订单状态流转: PENDING -> COMPLETED");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void updateOrderStatusAllowsSequentialTransition() {
        Order order = order(OrderStatus.PAID);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order updated = orderService.updateOrderStatus(1L, OrderStatus.SHIPPED);

        assertThat(updated.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        verify(orderRepository).save(order);
    }

    @Test
    void cancelOrderRejectsNonPendingOrder() {
        Order order = order(OrderStatus.PAID);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder(1L, "已付款后取消"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("只有待支付状态的订单才能取消");

        verify(bookRepository, never()).increaseStock(any(), any());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void cancelOrderRestoresStockAndMarksOrderCancelled() {
        Book book = new Book();
        book.setId(5L);
        book.setPrice(BigDecimal.TEN);
        book.setStock(3);

        OrderItem item = new OrderItem();
        item.setBook(book);
        item.setQuantity(2);
        item.setPrice(BigDecimal.TEN);

        Order order = order(OrderStatus.PENDING);
        order.setItems(List.of(item));
        item.setOrder(order);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order cancelled = orderService.cancelOrder(1L, "不想买了");

        assertThat(cancelled.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(cancelled.getCancelReason()).isEqualTo("不想买了");
        assertThat(cancelled.getCancelTime()).isNotNull();
        verify(bookRepository).increaseStock(5L, 2);
        verify(orderRepository).save(order);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createOrderReadsLowStockThresholdOncePerRequest() {
        authenticate(99L, "USER");

        Book firstBook = book(11L, "Book A", new BigDecimal("10.00"), 4);
        Book secondBook = book(12L, "Book B", new BigDecimal("20.00"), 8);

        OrderItem firstItem = orderItem(firstBook.getId(), 1);
        OrderItem secondItem = orderItem(secondBook.getId(), 2);

        Order order = order(OrderStatus.PENDING);
        order.setUser(null);
        order.setItems(List.of(firstItem, secondItem));

        SystemSetting setting = new SystemSetting();
        setting.setLowStockThreshold(5);

        when(systemSettingService.getSettings()).thenReturn(setting);
        when(bookRepository.findById(firstBook.getId())).thenReturn(Optional.of(firstBook));
        when(bookRepository.findById(secondBook.getId())).thenReturn(Optional.of(secondBook));
        when(bookRepository.decreaseStock(firstBook.getId(), 1)).thenReturn(1);
        when(bookRepository.decreaseStock(secondBook.getId(), 2)).thenReturn(1);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order saved = orderService.createOrder(order);

        assertThat(saved.getUser()).isNotNull();
        assertThat(saved.getUser().getId()).isEqualTo(99L);
        assertThat(saved.getTotalPrice()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(firstItem.getPrice()).isEqualByComparingTo(new BigDecimal("10.00"));
        assertThat(secondItem.getPrice()).isEqualByComparingTo(new BigDecimal("20.00"));
        verify(systemSettingService, times(1)).getSettings();
        verify(bookRepository, times(2)).findById(any(Long.class));
    }

    @Test
    void createOrderFromRequestRejectsInvalidCoupon() {
        authenticate(1L, "USER");

        User user = user(1L);
        Book book = book(11L, "Book A", new BigDecimal("10.00"), 5);
        OrderCreateRequest request = new OrderCreateRequest();
        request.setCouponId(99L);
        request.setItems(List.of(orderItemRequest(11L, 2)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(11L)).thenReturn(Optional.of(book), Optional.of(book));
        when(bookRepository.decreaseStock(11L, 2)).thenReturn(1);
        when(systemSettingService.getSettings()).thenReturn(new SystemSetting());
        when(couponService.useCoupon(1L, 99L, new BigDecimal("20.00"), null))
                .thenThrow(new RuntimeException("优惠券不可用"));

        assertThatThrownBy(() -> orderService.createOrderFromRequest(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("优惠券不可用");

        verify(orderRepository, never()).save(any(Order.class));
    }

    private void authenticate(Long userId, String role) {
        User user = new User();
        user.setId(userId);
        user.setUsername("user" + userId);
        user.setPassword("secret");
        user.setEmail("user" + userId + "@example.com");
        user.setRole(role);

        UserDetailsImpl principal = UserDetailsImpl.build(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("user" + id);
        user.setEmail("user" + id + "@example.com");
        user.setPassword("encoded-password");
        user.setRole("USER");
        return user;
    }

    private Order order(OrderStatus status) {
        Order order = new Order();
        order.setId(1L);
        order.setStatus(status);
        order.setTotalPrice(BigDecimal.TEN);
        return order;
    }

    private Book book(Long id, String title, BigDecimal price, Integer stock) {
        Book book = new Book();
        book.setId(id);
        book.setTitle(title);
        book.setPrice(price);
        book.setStock(stock);
        return book;
    }

    private OrderItem orderItem(Long bookId, Integer quantity) {
        Book book = new Book();
        book.setId(bookId);

        OrderItem item = new OrderItem();
        item.setBook(book);
        item.setQuantity(quantity);
        return item;
    }

    private OrderCreateRequest.OrderItemRequest orderItemRequest(Long bookId, Integer quantity) {
        OrderCreateRequest.OrderItemRequest itemRequest = new OrderCreateRequest.OrderItemRequest();
        itemRequest.setBookId(bookId);
        itemRequest.setQuantity(quantity);
        return itemRequest;
    }
}

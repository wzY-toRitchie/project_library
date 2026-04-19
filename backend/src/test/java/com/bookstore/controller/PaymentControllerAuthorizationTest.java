package com.bookstore.controller;

import com.alipay.api.AlipayApiException;
import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.AlipayService;
import com.bookstore.service.OrderService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerAuthorizationTest {

    @Mock
    private AlipayService alipayService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private PaymentController paymentController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createPaymentThrowsResourceNotFoundWhenOrderMissing() throws AlipayApiException {
        authenticate(1L, "USER");
        when(userRepository.findById(1L)).thenReturn(Optional.of(authenticatedUser(1L, "USER")));
        when(orderRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentController.createPayment(10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
        verify(alipayService, never()).createPayment(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void getPaymentStatusThrowsResourceNotFoundWhenOrderMissing() throws AlipayApiException {
        authenticate(1L, "USER");
        when(orderRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentController.getPaymentStatus(10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
        verify(alipayService, never()).queryOrder(10L);
    }

    @Test
    void getPaymentStatusRejectsNonOwnerNonAdminUser() throws AlipayApiException {
        authenticate(2L, "USER");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(orderOwnedBy(1L)));
        when(orderService.isOrderOwnedByUser(10L, 2L)).thenReturn(false);

        ResponseEntity<Map<String, String>> response = paymentController.getPaymentStatus(10L);

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).containsEntry("error", "无权操作此订单");
        verify(alipayService, never()).queryOrder(10L);
    }

    @Test
    void getPaymentStatusAllowsOwner() throws AlipayApiException {
        authenticate(1L, "USER");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(orderOwnedBy(1L)));
        when(orderService.isOrderOwnedByUser(10L, 1L)).thenReturn(true);

        ResponseEntity<Map<String, String>> response = paymentController.getPaymentStatus(10L);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).containsEntry("status", "UNKNOWN");
    }

    @Test
    void closeOrderThrowsResourceNotFoundWhenOrderMissing() throws AlipayApiException {
        authenticate(1L, "USER");
        when(orderRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentController.closeOrder(10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
        verify(alipayService, never()).closeOrder(10L);
    }

    @Test
    void closeOrderRejectsNonOwnerNonAdminUser() throws AlipayApiException {
        authenticate(2L, "USER");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(orderOwnedBy(1L)));
        when(orderService.isOrderOwnedByUser(10L, 2L)).thenReturn(false);

        ResponseEntity<Map<String, Object>> response = paymentController.closeOrder(10L);

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).containsEntry("error", "无权操作此订单");
        verify(alipayService, never()).closeOrder(10L);
    }

    @Test
    void refundThrowsResourceNotFoundWhenOrderMissing() throws AlipayApiException {
        authenticate(99L, "ADMIN");
        when(orderRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentController.refund(10L, "0"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
        verify(alipayService, never()).refund(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void refundRejectsNonAdminUser() throws AlipayApiException {
        authenticate(2L, "USER");

        ResponseEntity<Map<String, Object>> response = paymentController.refund(10L, "0");

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).containsEntry("error", "无权操作此订单");
        verify(alipayService, never()).refund(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void refundRejectsInvalidAmount() throws AlipayApiException {
        authenticate(99L, "ADMIN");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(orderOwnedBy(1L)));

        assertThatThrownBy(() -> paymentController.refund(10L, "abc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("退款金额格式无效");
        verify(alipayService, never()).refund(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void refundAllowsAdmin() throws AlipayApiException {
        authenticate(99L, "ADMIN");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(orderOwnedBy(1L)));
        when(alipayService.refund(10L, BigDecimal.valueOf(88))).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = paymentController.refund(10L, "0");

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).containsEntry("success", true);
    }

    private Order orderOwnedBy(Long userId) {
        User user = new User();
        user.setId(userId);

        Order order = new Order();
        order.setId(10L);
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(BigDecimal.valueOf(88));
        return order;
    }

    private User authenticatedUser(Long userId, String role) {
        User user = new User();
        user.setId(userId);
        user.setUsername("user" + userId);
        user.setPassword("secret");
        user.setEmail("user" + userId + "@example.com");
        user.setRole(role);
        return user;
    }

    private void authenticate(Long userId, String role) {
        User user = authenticatedUser(userId, role);

        UserDetailsImpl principal = UserDetailsImpl.build(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }
}

package com.bookstore.controller;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.payload.request.OrderCreateRequest;
import com.bookstore.security.services.UserDetailsImpl;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerExceptionSemanticsTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getOrderByIdPropagatesResourceNotFoundException() {
        authenticate(1L, "USER");
        when(orderService.getOrderById(10L)).thenThrow(new ResourceNotFoundException("订单不存在"));

        assertThatThrownBy(() -> orderController.getOrderById(10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
    }

    @Test
    void getOrderByIdRejectsOtherUsersOrder() {
        authenticate(2L, "USER");
        when(orderService.getOrderById(10L)).thenReturn(orderOwnedBy(1L, OrderStatus.PENDING));

        assertThatThrownBy(() -> orderController.getOrderById(10L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("无权查看他人订单");
    }

    @Test
    void createOrderPropagatesBadRequestException() {
        authenticate(1L, "USER");
        OrderCreateRequest request = new OrderCreateRequest();
        when(orderService.createOrderFromRequest(request)).thenThrow(new BadRequestException("订单项不能为空"));

        assertThatThrownBy(() -> orderController.createOrder(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("订单项不能为空");
    }

    @Test
    void updateOrderStatusPropagatesResourceNotFoundException() {
        authenticate(1L, "ADMIN");
        when(orderService.updateOrderStatus(10L, OrderStatus.PAID))
                .thenThrow(new ResourceNotFoundException("订单不存在"));

        assertThatThrownBy(() -> orderController.updateOrderStatus(10L, "PAID"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
    }

    @Test
    void updateOrderStatusRejectsNonOwner() {
        authenticate(2L, "USER");
        when(orderService.isOrderOwnedByUser(10L, 2L)).thenReturn(false);

        ResponseEntity<?> response = orderController.updateOrderStatus(10L, "PAID");

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).isEqualTo("无权修改他人订单状态");
        verify(orderService, never()).updateOrderStatus(10L, OrderStatus.PAID);
    }

    @Test
    void updateOrderStatusRejectsPaidTransitionForOwner() {
        authenticate(2L, "USER");
        when(orderService.isOrderOwnedByUser(10L, 2L)).thenReturn(true);

        ResponseEntity<?> response = orderController.updateOrderStatus(10L, "PAID");

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).isEqualTo("无权执行此操作");
        verify(orderService, never()).updateOrderStatus(10L, OrderStatus.PAID);
    }

    @Test
    void cancelOrderPropagatesResourceNotFoundException() {
        authenticate(1L, "ADMIN");
        when(orderService.cancelOrder(10L, "changed mind"))
                .thenThrow(new ResourceNotFoundException("订单不存在"));

        assertThatThrownBy(() -> orderController.cancelOrder(10L, java.util.Map.of("reason", "changed mind")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("订单不存在");
    }

    private Order orderOwnedBy(Long userId, OrderStatus status) {
        User user = new User();
        user.setId(userId);

        Order order = new Order();
        order.setId(10L);
        order.setUser(user);
        order.setStatus(status);
        order.setTotalPrice(BigDecimal.TEN);
        return order;
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
}

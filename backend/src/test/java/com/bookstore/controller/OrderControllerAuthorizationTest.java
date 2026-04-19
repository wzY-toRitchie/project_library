package com.bookstore.controller;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.payload.response.PageResponse;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.OrderService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerAuthorizationTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getOrdersByUserIdRejectsOtherNonAdminUser() {
        authenticate(1L, "USER");

        assertThatThrownBy(() -> orderController.getOrdersByUserId(2L, 0, 10))
                .isInstanceOf(ForbiddenException.class);
        verify(orderService, never()).getOrdersByUserId(any(), any());
    }

    @Test
    void getOrdersByUserIdAllowsOwner() {
        authenticate(1L, "USER");
        Order order = orderOwnedBy(1L);
        when(orderService.getOrdersByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(order)));

        PageResponse<Order> response = orderController.getOrdersByUserId(1L, 0, 10);

        assertThat(response.getContent()).containsExactly(order);
    }

    @Test
    void getOrdersByUserIdAllowsAdmin() {
        authenticate(99L, "ADMIN");
        Order order = orderOwnedBy(1L);
        when(orderService.getOrdersByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(order)));

        PageResponse<Order> response = orderController.getOrdersByUserId(1L, 0, 10);

        assertThat(response.getContent()).containsExactly(order);
    }

    @Test
    void getOrderByIdRejectsOtherNonAdminUser() {
        authenticate(2L, "USER");
        when(orderService.getOrderById(10L)).thenReturn(orderOwnedBy(1L));

        assertThatThrownBy(() -> orderController.getOrderById(10L))
                .isInstanceOf(ForbiddenException.class);
        verify(orderService).getOrderById(10L);
    }

    @Test
    void getOrderByIdAllowsOwner() {
        authenticate(1L, "USER");
        Order order = orderOwnedBy(1L);
        when(orderService.getOrderById(10L)).thenReturn(order);

        ResponseEntity<Order> response = orderController.getOrderById(10L);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(order);
    }

    @Test
    void getOrderByIdAllowsAdmin() {
        authenticate(99L, "ADMIN");
        Order order = orderOwnedBy(1L);
        when(orderService.getOrderById(10L)).thenReturn(order);

        ResponseEntity<Order> response = orderController.getOrderById(10L);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(order);
    }

    @Test
    void batchUpdateOrderStatusRejectsNonAdminUser() {
        authenticate(1L, "USER");
        Map<String, Object> request = Map.of("orderIds", List.of(1, 2), "status", "SHIPPED");

        assertThatThrownBy(() -> orderController.batchUpdateOrderStatus(request))
                .isInstanceOf(ForbiddenException.class);
        verify(orderService, never()).batchUpdateOrderStatus(any(), any());
    }

    @Test
    void batchUpdateOrderStatusAllowsAdmin() {
        authenticate(99L, "ADMIN");
        Map<String, Object> request = Map.of("orderIds", List.of(1, 2), "status", "SHIPPED");
        when(orderService.batchUpdateOrderStatus(List.of(1, 2), OrderStatus.SHIPPED)).thenReturn(2);

        ResponseEntity<?> response = orderController.batchUpdateOrderStatus(request);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(Map.of("message", "批量更新成功", "count", 2));
    }

    private Order orderOwnedBy(Long userId) {
        User user = new User();
        user.setId(userId);

        Order order = new Order();
        order.setId(10L);
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
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

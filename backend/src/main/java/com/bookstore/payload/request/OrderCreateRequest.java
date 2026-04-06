package com.bookstore.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class OrderCreateRequest {
    private List<OrderItemRequest> items;
    private Long couponId;

    @Data
    public static class OrderItemRequest {
        private Long bookId;
        private Integer quantity;
    }
}

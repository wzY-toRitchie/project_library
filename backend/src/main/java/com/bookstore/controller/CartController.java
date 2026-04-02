package com.bookstore.controller;

import com.bookstore.entity.CartItem;
import com.bookstore.service.CartService;
import com.bookstore.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@Tag(name = "购物车", description = "购物车管理接口")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    @Operation(summary = "获取购物车", description = "获取当前用户购物车中的所有商品")
    @GetMapping
    public List<CartItem> getCartItems() {
        return cartService.getCartItems(getCurrentUserId());
    }

    @Operation(summary = "添加商品", description = "将图书添加到购物车")
    @PostMapping
    public CartItem addToCart(@RequestParam Long bookId, @RequestParam Integer quantity) {
        return cartService.addToCart(getCurrentUserId(), bookId, quantity);
    }

    @Operation(summary = "更新数量", description = "修改购物车中商品的数量")
    @PutMapping("/{bookId}")
    public ResponseEntity<Void> updateQuantity(@PathVariable Long bookId, @RequestParam Integer quantity) {
        cartService.updateQuantity(getCurrentUserId(), bookId, quantity);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "移除商品", description = "从购物车中移除指定商品")
    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long bookId) {
        cartService.removeFromCart(getCurrentUserId(), bookId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "清空购物车", description = "清空当前用户的购物车")
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}

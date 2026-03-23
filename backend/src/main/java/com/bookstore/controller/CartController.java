package com.bookstore.controller;

import com.bookstore.entity.CartItem;
import com.bookstore.service.CartService;
import com.bookstore.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    @GetMapping
    public List<CartItem> getCartItems() {
        return cartService.getCartItems(getCurrentUserId());
    }

    @PostMapping
    public CartItem addToCart(@RequestParam Long bookId, @RequestParam Integer quantity) {
        return cartService.addToCart(getCurrentUserId(), bookId, quantity);
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<Void> updateQuantity(@PathVariable Long bookId, @RequestParam Integer quantity) {
        cartService.updateQuantity(getCurrentUserId(), bookId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long bookId) {
        cartService.removeFromCart(getCurrentUserId(), bookId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}

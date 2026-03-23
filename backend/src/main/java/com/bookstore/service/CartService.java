package com.bookstore.service;

import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.entity.Book;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    public List<CartItem> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    @Transactional
    public CartItem addToCart(Long userId, Long bookId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("图书不存在"));

        // 检查是否已存在
        CartItem existingItem = cartItemRepository.findByUserIdAndBookId(userId, bookId).orElse(null);
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return cartItemRepository.save(existingItem);
        }

        CartItem cartItem = new CartItem();
        cartItem.setUser(user);
        cartItem.setBook(book);
        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void updateQuantity(Long userId, Long bookId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new RuntimeException("购物车中没有该商品"));
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeFromCart(Long userId, Long bookId) {
        CartItem cartItem = cartItemRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new RuntimeException("购物车中没有该商品"));
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}

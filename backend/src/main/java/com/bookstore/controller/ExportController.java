package com.bookstore.controller;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/orders")
    public ResponseEntity<byte[]> exportOrders() {
        List<Order> orders = orderRepository.findAll();
        
        StringBuilder csv = new StringBuilder();
        csv.append("订单号,用户,金额,状态,下单时间\n");
        
        for (Order order : orders) {
            csv.append(String.format("%s,%s,%.2f,%s,%s\n",
                order.getId() != null ? "ORD-" + String.format("%06d", order.getId()) : "",
                order.getUser() != null ? order.getUser().getUsername() : "",
                order.getTotalPrice() != null ? order.getTotalPrice().doubleValue() : 0.0,
                getStatusLabel(order.getStatus()),
                order.getCreateTime() != null ? order.getCreateTime().format(formatter) : ""
            ));
        }
        
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "orders.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    @GetMapping("/users")
    public ResponseEntity<byte[]> exportUsers() {
        List<User> users = userRepository.findAll();
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,用户名,邮箱,姓名,手机号,角色,注册时间\n");
        
        for (User user : users) {
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%s\n",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName() != null ? user.getFullName() : "",
                user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                user.getRole(),
                user.getCreateTime() != null ? user.getCreateTime().format(formatter) : ""
            ));
        }
        
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "users.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    @GetMapping("/books")
    public ResponseEntity<byte[]> exportBooks() {
        var books = bookRepository.findAll();
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,书名,作者,价格,库存,分类\n");
        
        for (var book : books) {
            csv.append(String.format("%d,%s,%s,%.2f,%d,%s\n",
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getPrice() != null ? book.getPrice().doubleValue() : 0.0,
                book.getStock(),
                book.getCategory() != null ? book.getCategory().getName() : ""
            ));
        }
        
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "books.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }

    private String getStatusLabel(com.bookstore.enums.OrderStatus status) {
        if (status == null) return "";
        return status.getDescription();
    }
}

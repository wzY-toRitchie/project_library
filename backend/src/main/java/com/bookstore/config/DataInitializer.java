package com.bookstore.config;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(CategoryRepository categoryRepository,
            BookRepository bookRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialize Users
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@example.com");
                admin.setRole("ADMIN");

                User user = new User();
                user.setUsername("user");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setEmail("user@example.com");
                user.setRole("USER");

                userRepository.saveAll(Arrays.asList(admin, user));
            }

            // Initialize Categories
            if (categoryRepository.count() == 0) {
                Category c1 = new Category();
                c1.setName("计算机");

                Category c2 = new Category();
                c2.setName("文学");

                Category c3 = new Category();
                c3.setName("历史");

                Category c4 = new Category();
                c4.setName("科幻");

                categoryRepository.saveAll(Arrays.asList(c1, c2, c3, c4));

                // Initialize Books
                if (bookRepository.count() == 0) {
                    Book b1 = new Book();
                    b1.setTitle("Java 核心技术");
                    b1.setAuthor("Cay S. Horstmann");
                    b1.setPrice(new BigDecimal("119.00"));
                    b1.setStock(100);
                    b1.setDescription("Java 领域经典著作，全面覆盖 Java 基础与高级特性。");
                    b1.setCategory(c1);
                    b1.setCoverImage(
                            "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                    Book b2 = new Book();
                    b2.setTitle("深入理解计算机系统");
                    b2.setAuthor("Randal E. Bryant");
                    b2.setPrice(new BigDecimal("139.00"));
                    b2.setStock(50);
                    b2.setDescription("计算机科学领域的经典教材，从程序员视角深入解析计算机系统。");
                    b2.setCategory(c1);
                    b2.setCoverImage(
                            "https://img10.360buyimg.com/n1/jfs/t1/231121/11/1440/150244/6530a61cF0f214f4e/4694460f1661601a.jpg");

                    Book b3 = new Book();
                    b3.setTitle("三体");
                    b3.setAuthor("刘慈欣");
                    b3.setPrice(new BigDecimal("68.00"));
                    b3.setStock(200);
                    b3.setDescription("中国科幻基石之作，讲述人类与三体文明的博弈。");
                    b3.setCategory(c4);
                    b3.setCoverImage(
                            "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                    Book b4 = new Book();
                    b4.setTitle("百年孤独");
                    b4.setAuthor("加西亚·马尔克斯");
                    b4.setPrice(new BigDecimal("55.00"));
                    b4.setStock(80);
                    b4.setDescription("魔幻现实主义文学代表作，描写布恩迪亚家族七代人的传奇故事。");
                    b4.setCategory(c2);
                    b4.setCoverImage(
                            "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                    Book b5 = new Book();
                    b5.setTitle("明朝那些事儿");
                    b5.setAuthor("当年明月");
                    b5.setPrice(new BigDecimal("198.00"));
                    b5.setStock(80);
                    b5.setDescription("全景式展现明朝三百年的历史风云，通俗易懂的历史巨著。");
                    b5.setCategory(c3);
                    b5.setCoverImage(
                            "https://img10.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                    bookRepository.saveAll(Arrays.asList(b1, b2, b3, b4, b5));
                }
            }
        };
    }
}

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
                        User admin = null;
                        User user = null;

                        if (!userRepository.existsByUsername("admin")) {
                                admin = new User();
                                admin.setUsername("admin");
                                admin.setPassword(passwordEncoder.encode("admin123"));
                                admin.setEmail("admin@example.com");
                                admin.setRole("ADMIN");
                        }

                        if (!userRepository.existsByUsername("user")) {
                                user = new User();
                                user.setUsername("user");
                                user.setPassword(passwordEncoder.encode("user123"));
                                user.setEmail("user@example.com");
                                user.setRole("USER");
                        }

                        if (admin != null && user != null) {
                                userRepository.saveAll(Arrays.asList(admin, user));
                        } else if (admin != null) {
                                userRepository.save(admin);
                        } else if (user != null) {
                                userRepository.save(user);
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

                                        Book b6 = new Book();
                                        b6.setTitle("活着");
                                        b6.setAuthor("余华");
                                        b6.setPrice(new BigDecimal("28.00"));
                                        b6.setStock(150);
                                        b6.setDescription("讲述了人如何去承受巨大的苦难，讲述了眼泪的丰富和宽广。");
                                        b6.setCategory(c2);
                                        b6.setCoverImage(
                                                        "https://img14.360buyimg.com/n1/jfs/t1/110905/23/23247/100536/62441a0eE02022830/6233342.jpg");

                                        Book b7 = new Book();
                                        b7.setTitle("算法导论");
                                        b7.setAuthor("Thomas H. Cormen");
                                        b7.setPrice(new BigDecimal("128.00"));
                                        b7.setStock(60);
                                        b7.setDescription("计算机算法领域的标准教材，被誉为算法领域的'圣经'。");
                                        b7.setCategory(c1);
                                        b7.setCoverImage(
                                                        "https://img12.360buyimg.com/n1/jfs/t1/107755/26/22606/151125/62441a0eE12313123/1231312.jpg");

                                        Book b8 = new Book();
                                        b8.setTitle("人类简史");
                                        b8.setAuthor("尤瓦尔·赫拉利");
                                        b8.setPrice(new BigDecimal("68.00"));
                                        b8.setStock(120);
                                        b8.setDescription("从认知革命到科学革命，全景式回顾人类历史。");
                                        b8.setCategory(c3);
                                        b8.setCoverImage(
                                                        "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                                        Book b9 = new Book();
                                        b9.setTitle("万历十五年");
                                        b9.setAuthor("黄仁宇");
                                        b9.setPrice(new BigDecimal("45.00"));
                                        b9.setStock(90);
                                        b9.setDescription("通过对万历十五年几个关键人物的描述，揭示大明王朝的兴衰秘密。");
                                        b9.setCategory(c3);
                                        b9.setCoverImage(
                                                        "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                                        Book b10 = new Book();
                                        b10.setTitle("银河帝国");
                                        b10.setAuthor("阿西莫夫");
                                        b10.setPrice(new BigDecimal("299.00"));
                                        b10.setStock(30);
                                        b10.setDescription("科幻文学界的诺贝尔奖级作品，讲述人类未来两万年的历史。");
                                        b10.setCategory(c4);
                                        b10.setCoverImage(
                                                        "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                                        Book b11 = new Book();
                                        b11.setTitle("Python编程：从入门到实践");
                                        b11.setAuthor("Eric Matthes");
                                        b11.setPrice(new BigDecimal("89.00"));
                                        b11.setStock(200);
                                        b11.setDescription("最畅销的 Python 编程教程，适合所有层次的读者。");
                                        b11.setCategory(c1);
                                        b11.setCoverImage(
                                                        "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                                        bookRepository.saveAll(
                                                        Arrays.asList(b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11));
                                }
                        }
                };
        }
}

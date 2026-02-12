package com.bookstore.config;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

        @Bean
        public CommandLineRunner initData(CategoryRepository categoryRepository,
                        BookRepository bookRepository,
                        UserRepository userRepository,
                        OrderRepository orderRepository,
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

                        List<User> extraUsers = new ArrayList<>();
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "alice", "alice@example.com", "陈雨晴",
                                        "13911112222", "上海市徐汇区天钥桥路", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "bob", "bob@example.com", "李明哲",
                                        "13722223333", "北京市朝阳区望京街道", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "charlie", "charlie@example.com", "王启航",
                                        "13633334444", "广州市天河区珠江新城", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "diana", "diana@example.com", "周思敏",
                                        "13544445555", "深圳市南山区科技园", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "edward", "edward@example.com", "郑浩然",
                                        "13455556666", "杭州市西湖区文三路", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "frank", "frank@example.com", "赵子昂",
                                        "13366667777", "成都市高新区天府大道", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "grace", "grace@example.com", "孙雨珊",
                                        "13277778888", "南京市鼓楼区中山路", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "helen", "helen@example.com", "刘嘉宁",
                                        "13188889999", "武汉市武昌区中南路", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "manager", "manager@example.com", "钱泽宇",
                                        "13099990000", "重庆市渝中区解放碑", "ADMIN");
                        if (!extraUsers.isEmpty()) {
                                userRepository.saveAll(extraUsers);
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

                                        Book b12 = new Book();
                                        b12.setTitle("代码整洁之道");
                                        b12.setAuthor("Robert C. Martin");
                                        b12.setPrice(new BigDecimal("79.00"));
                                        b12.setStock(140);
                                        b12.setDescription("软件工程经典读物，讲解如何写出清晰、可维护的代码。");
                                        b12.setCategory(c1);
                                        b12.setCoverImage(
                                                        "https://img13.360buyimg.com/n1/jfs/t1/195113/16/18219/127890/611b1fa2E12c3fd2f/af16c97a8dc2b1f4.jpg");

                                        Book b13 = new Book();
                                        b13.setTitle("设计模式");
                                        b13.setAuthor("Erich Gamma");
                                        b13.setPrice(new BigDecimal("99.00"));
                                        b13.setStock(70);
                                        b13.setDescription("面向对象设计模式经典书籍，介绍 23 种设计模式。");
                                        b13.setCategory(c1);
                                        b13.setCoverImage(
                                                        "https://img11.360buyimg.com/n1/jfs/t1/140989/4/272/178258/5ebf7c5eE4a4ea8fe/2e2e9c0ce3f4bf1f.jpg");

                                        Book b14 = new Book();
                                        b14.setTitle("时间简史");
                                        b14.setAuthor("史蒂芬·霍金");
                                        b14.setPrice(new BigDecimal("56.00"));
                                        b14.setStock(110);
                                        b14.setDescription("通俗物理学经典，探索宇宙起源与时间的奥秘。");
                                        b14.setCategory(c4);
                                        b14.setCoverImage(
                                                        "https://img12.360buyimg.com/n1/jfs/t1/120686/32/20974/108277/62c3d0e9E0f6c5d51/2cbbcd35d6f0a2a9.jpg");

                                        Book b15 = new Book();
                                        b15.setTitle("白夜行");
                                        b15.setAuthor("东野圭吾");
                                        b15.setPrice(new BigDecimal("49.00"));
                                        b15.setStock(130);
                                        b15.setDescription("推理与人性并重的畅销小说，故事结构精巧。");
                                        b15.setCategory(c2);
                                        b15.setCoverImage(
                                                        "https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34a6f7c0/04357f1340b7f217.jpg");

                                        Book b16 = new Book();
                                        b16.setTitle("解忧杂货店");
                                        b16.setAuthor("东野圭吾");
                                        b16.setPrice(new BigDecimal("42.00"));
                                        b16.setStock(180);
                                        b16.setDescription("温暖治愈的故事，展示人心的善意与救赎。");
                                        b16.setCategory(c2);
                                        b16.setCoverImage(
                                                        "https://img13.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                                        Book b17 = new Book();
                                        b17.setTitle("史记");
                                        b17.setAuthor("司马迁");
                                        b17.setPrice(new BigDecimal("158.00"));
                                        b17.setStock(60);
                                        b17.setDescription("中国史学经典之作，纪传体史书的开山之作。");
                                        b17.setCategory(c3);
                                        b17.setCoverImage(
                                                        "https://img10.360buyimg.com/n1/jfs/t1/120686/32/20974/108277/62c3d0e9E0f6c5d51/2cbbcd35d6f0a2a9.jpg");

                                        Book b18 = new Book();
                                        b18.setTitle("秦汉史");
                                        b18.setAuthor("吕思勉");
                                        b18.setPrice(new BigDecimal("68.00"));
                                        b18.setStock(90);
                                        b18.setDescription("系统梳理秦汉时期历史事件与制度演变。");
                                        b18.setCategory(c3);
                                        b18.setCoverImage(
                                                        "https://img12.360buyimg.com/n1/jfs/t1/120686/32/20974/108277/62c3d0e9E0f6c5d51/2cbbcd35d6f0a2a9.jpg");

                                        Book b19 = new Book();
                                        b19.setTitle("银河系漫游指南");
                                        b19.setAuthor("道格拉斯·亚当斯");
                                        b19.setPrice(new BigDecimal("59.00"));
                                        b19.setStock(100);
                                        b19.setDescription("充满想象力与幽默的科幻经典。");
                                        b19.setCategory(c4);
                                        b19.setCoverImage(
                                                        "https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg");

                                        Book b20 = new Book();
                                        b20.setTitle("机器学习实战");
                                        b20.setAuthor("Peter Harrington");
                                        b20.setPrice(new BigDecimal("88.00"));
                                        b20.setStock(75);
                                        b20.setDescription("通过实践案例掌握机器学习核心算法。");
                                        b20.setCategory(c1);
                                        b20.setCoverImage(
                                                        "https://img11.360buyimg.com/n1/jfs/t1/140989/4/272/178258/5ebf7c5eE4a4ea8fe/2e2e9c0ce3f4bf1f.jpg");

                                        bookRepository.saveAll(
                                                        Arrays.asList(b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12,
                                                                        b13, b14, b15, b16, b17, b18, b19, b20));
                                }
                        }

                        if (orderRepository.count() == 0 && bookRepository.count() > 0 && userRepository.count() > 0) {
                                List<Book> books = bookRepository.findAll();
                                User baseUser = userRepository.findByUsername("user").orElse(null);
                                User alice = userRepository.findByUsername("alice").orElse(null);
                                User bob = userRepository.findByUsername("bob").orElse(null);
                                User charlie = userRepository.findByUsername("charlie").orElse(null);
                                User diana = userRepository.findByUsername("diana").orElse(null);
                                User edward = userRepository.findByUsername("edward").orElse(null);
                                User frank = userRepository.findByUsername("frank").orElse(null);
                                User grace = userRepository.findByUsername("grace").orElse(null);
                                User helen = userRepository.findByUsername("helen").orElse(null);

                                Book javaCore = findBook(books, "Java 核心技术");
                                Book csApp = findBook(books, "深入理解计算机系统");
                                Book threeBody = findBook(books, "三体");
                                Book cleanCode = findBook(books, "代码整洁之道");
                                Book designPatterns = findBook(books, "设计模式");
                                Book cosmos = findBook(books, "时间简史");
                                Book wander = findBook(books, "银河系漫游指南");
                                Book python = findBook(books, "Python编程：从入门到实践");
                                Book humanHistory = findBook(books, "人类简史");
                                Book alive = findBook(books, "活着");
                                Book galaxyEmpire = findBook(books, "银河帝国");
                                Book whiteNight = findBook(books, "白夜行");

                                List<Order> orders = new ArrayList<>();

                                Order o1 = buildOrder(baseUser, "PENDING", LocalDateTime.now().minusHours(6),
                                                Arrays.asList(buildItem(javaCore, 1), buildItem(python, 2)));
                                addOrderIfValid(orders, o1);

                                Order o2 = buildOrder(alice, "PAID", LocalDateTime.now().minusDays(1),
                                                Arrays.asList(buildItem(threeBody, 1), buildItem(alive, 2)));
                                addOrderIfValid(orders, o2);

                                Order o3 = buildOrder(bob, "SHIPPED", LocalDateTime.now().minusDays(3),
                                                Arrays.asList(buildItem(csApp, 1), buildItem(cleanCode, 1)));
                                addOrderIfValid(orders, o3);

                                Order o4 = buildOrder(charlie, "COMPLETED", LocalDateTime.now().minusDays(5),
                                                Arrays.asList(buildItem(humanHistory, 1), buildItem(whiteNight, 1)));
                                addOrderIfValid(orders, o4);

                                Order o5 = buildOrder(diana, "CANCELLED", LocalDateTime.now().minusDays(2),
                                                Arrays.asList(buildItem(galaxyEmpire, 1)));
                                addOrderIfValid(orders, o5);

                                Order o6 = buildOrder(edward, "PAID", LocalDateTime.now().minusDays(7),
                                                Arrays.asList(buildItem(designPatterns, 1), buildItem(cleanCode, 1)));
                                addOrderIfValid(orders, o6);

                                Order o7 = buildOrder(frank, "SHIPPED", LocalDateTime.now().minusDays(8),
                                                Arrays.asList(buildItem(cosmos, 1), buildItem(wander, 1)));
                                addOrderIfValid(orders, o7);

                                Order o8 = buildOrder(grace, "COMPLETED", LocalDateTime.now().minusDays(10),
                                                Arrays.asList(buildItem(javaCore, 1), buildItem(csApp, 1), buildItem(threeBody, 1)));
                                addOrderIfValid(orders, o8);

                                Order o9 = buildOrder(helen, "PENDING", LocalDateTime.now().minusHours(3),
                                                Arrays.asList(buildItem(whiteNight, 1), buildItem(alive, 1)));
                                addOrderIfValid(orders, o9);

                                if (!orders.isEmpty()) {
                                        orderRepository.saveAll(orders);
                                }
                        }
                };
        }

        private void addUserIfMissing(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        List<User> users,
                        String username,
                        String email,
                        String fullName,
                        String phoneNumber,
                        String address,
                        String role) {
                if (userRepository.existsByUsername(username)) {
                        return;
                }
                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode("user123"));
                user.setEmail(email);
                user.setFullName(fullName);
                user.setPhoneNumber(phoneNumber);
                user.setAddress(address);
                user.setRole(role);
                users.add(user);
        }

        private Book findBook(List<Book> books, String title) {
                for (Book book : books) {
                        if (title.equals(book.getTitle())) {
                                return book;
                        }
                }
                return null;
        }

        private OrderItem buildItem(Book book, int quantity) {
                if (book == null) {
                        return null;
                }
                OrderItem item = new OrderItem();
                item.setBook(book);
                item.setQuantity(quantity);
                item.setPrice(book.getPrice());
                return item;
        }

        private Order buildOrder(User user, String status, LocalDateTime createTime, List<OrderItem> items) {
                if (user == null) {
                        return null;
                }
                List<OrderItem> normalized = new ArrayList<>();
                for (OrderItem item : items) {
                        if (item != null) {
                                normalized.add(item);
                        }
                }
                if (normalized.isEmpty()) {
                        return null;
                }
                Order order = new Order();
                order.setUser(user);
                order.setStatus(status);
                order.setCreateTime(createTime);
                order.setItems(normalized);
                BigDecimal total = BigDecimal.ZERO;
                for (OrderItem item : normalized) {
                        total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                        item.setOrder(order);
                }
                order.setTotalPrice(total);
                return order;
        }

        private void addOrderIfValid(List<Order> orders, Order order) {
                if (order != null) {
                        orders.add(order);
                }
        }
}

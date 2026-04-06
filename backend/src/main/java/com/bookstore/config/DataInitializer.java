package com.bookstore.config;

import com.bookstore.entity.Address;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.User;
import com.bookstore.enums.OrderStatus;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
@Profile("dev")
public class DataInitializer {

        @Bean
        public CommandLineRunner initData(CategoryRepository categoryRepository,
                        BookRepository bookRepository,
                        UserRepository userRepository,
                        OrderRepository orderRepository,
                        AddressRepository addressRepository,
                        CouponRepository couponRepository,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        // Initialize Users
                        User admin = null;
                        User user = null;

                        if (!userRepository.existsByUsername("admin")) {
                                admin = new User();
                                admin.setUsername("admin");
                                admin.setPassword(passwordEncoder.encode("Admin@123"));
                                admin.setEmail("admin@example.com");
                                admin.setRole("ADMIN");
                        }

                        if (!userRepository.existsByUsername("user")) {
                                user = new User();
                                user.setUsername("user");
                                user.setPassword(passwordEncoder.encode("User@1234"));
                                user.setEmail("user@example.com");
                                user.setRole("USER");
                        }

                        List<User> initialUsers = new ArrayList<>();
                        if (admin != null) {
                                initialUsers.add(admin);
                        }
                        if (user != null) {
                                initialUsers.add(user);
                        }
                        if (!initialUsers.isEmpty()) {
                                userRepository.saveAll(initialUsers);
                        }

                        List<User> extraUsers = new ArrayList<>();
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "alice", "alice@example.com",
                                        "陈雨晴",
                                        "13911112222", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "bob", "bob@example.com", "李明哲",
                                        "13722223333", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "charlie", "charlie@example.com",
                                        "王启航",
                                        "13633334444", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "diana", "diana@example.com",
                                        "周思敏",
                                        "13544445555", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "edward", "edward@example.com",
                                        "郑浩然",
                                        "13455556666", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "frank", "frank@example.com",
                                        "赵子昂",
                                        "13366667777", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "grace", "grace@example.com",
                                        "孙雨珊",
                                        "13277778888", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "helen", "helen@example.com",
                                        "刘嘉宁",
                                        "13188889999", "USER");
                        addUserIfMissing(userRepository, passwordEncoder, extraUsers, "manager", "manager@example.com",
                                        "钱泽宇",
                                        "13099990000", "ADMIN");
                        if (!extraUsers.isEmpty()) {
                                userRepository.saveAll(extraUsers);
                        }

                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("admin").orElse(null),
                                        "管理员", "18800001111", "北京市海淀区中关村大街");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("user").orElse(null),
                                        "示例用户", "18800002222", "上海市浦东新区世纪大道");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("alice").orElse(null),
                                        "陈雨晴", "13911112222", "上海市徐汇区天钥桥路");
                        addDefaultAddressIfMissing(addressRepository, userRepository.findByUsername("bob").orElse(null),
                                        "李明哲", "13722223333", "北京市朝阳区望京街道");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("charlie").orElse(null),
                                        "王启航", "13633334444", "广州市天河区珠江新城");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("diana").orElse(null),
                                        "周思敏", "13544445555", "深圳市南山区科技园");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("edward").orElse(null),
                                        "郑浩然", "13455556666", "杭州市西湖区文三路");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("frank").orElse(null),
                                        "赵子昂", "13366667777", "成都市高新区天府大道");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("grace").orElse(null),
                                        "孙雨珊", "13277778888", "南京市鼓楼区中山路");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("helen").orElse(null),
                                        "刘嘉宁", "13188889999", "武汉市武昌区中南路");
                        addDefaultAddressIfMissing(addressRepository,
                                        userRepository.findByUsername("manager").orElse(null),
                                        "钱泽宇", "13099990000", "重庆市渝中区解放碑");

                        List<Category> existingCategories = categoryRepository.findAll();
                        Map<String, Category> categoriesByName = new HashMap<>();
                        for (Category category : existingCategories) {
                                if (category.getName() != null) {
                                        categoriesByName.put(category.getName(), category);
                                }
                        }

                        List<Category> categoriesToSave = new ArrayList<>();
                        Category c1 = categoriesByName.get("计算机");
                        if (c1 == null) {
                                c1 = new Category();
                                c1.setName("计算机");
                                categoriesToSave.add(c1);
                        }
                        Category c2 = categoriesByName.get("文学");
                        if (c2 == null) {
                                c2 = new Category();
                                c2.setName("文学");
                                categoriesToSave.add(c2);
                        }
                        Category c3 = categoriesByName.get("历史");
                        if (c3 == null) {
                                c3 = new Category();
                                c3.setName("历史");
                                categoriesToSave.add(c3);
                        }
                        Category c4 = categoriesByName.get("科幻");
                        if (c4 == null) {
                                c4 = new Category();
                                c4.setName("科幻");
                                categoriesToSave.add(c4);
                        }
                        Category c5 = categoriesByName.get("心理学");
                        if (c5 == null) {
                                c5 = new Category();
                                c5.setName("心理学");
                                categoriesToSave.add(c5);
                        }
                        Category c6 = categoriesByName.get("经济");
                        if (c6 == null) {
                                c6 = new Category();
                                c6.setName("经济");
                                categoriesToSave.add(c6);
                        }
                        Category c7 = categoriesByName.get("哲学");
                        if (c7 == null) {
                                c7 = new Category();
                                c7.setName("哲学");
                                categoriesToSave.add(c7);
                        }
                        Category c8 = categoriesByName.get("艺术");
                        if (c8 == null) {
                                c8 = new Category();
                                c8.setName("艺术");
                                categoriesToSave.add(c8);
                        }
                        Category c9 = categoriesByName.get("教育");
                        if (c9 == null) {
                                c9 = new Category();
                                c9.setName("教育");
                                categoriesToSave.add(c9);
                        }
                        Category c10 = categoriesByName.get("管理");
                        if (c10 == null) {
                                c10 = new Category();
                                c10.setName("管理");
                                categoriesToSave.add(c10);
                        }
                        if (!categoriesToSave.isEmpty()) {
                                categoryRepository.saveAll(categoriesToSave);
                                existingCategories = categoryRepository.findAll();
                                categoriesByName.clear();
                                for (Category category : existingCategories) {
                                        if (category.getName() != null) {
                                                categoriesByName.put(category.getName(), category);
                                        }
                                }
                                c1 = categoriesByName.get("计算机");
                                c2 = categoriesByName.get("文学");
                                c3 = categoriesByName.get("历史");
                                c4 = categoriesByName.get("科幻");
                                c5 = categoriesByName.get("心理学");
                                c6 = categoriesByName.get("经济");
                                c7 = categoriesByName.get("哲学");
                                c8 = categoriesByName.get("艺术");
                                c9 = categoriesByName.get("教育");
                                c10 = categoriesByName.get("管理");
                        }

                        List<Book> existingBooks = bookRepository.findAll();
                        Set<String> existingTitles = new HashSet<>();
                        for (Book book : existingBooks) {
                                if (book.getTitle() != null) {
                                        existingTitles.add(book.getTitle().trim().toLowerCase());
                                }
                        }
                        List<Book> booksToSave = new ArrayList<>();
                        addBookIfMissing(booksToSave, existingTitles, "Java 核心技术", "Cay S. Horstmann",
                                        new BigDecimal("119.00"), 100,
                                        "Java 领域经典著作，全面覆盖 Java 基础与高级特性。", c1,
                                        "/covers/java-core.png");
                        addBookIfMissing(booksToSave, existingTitles, "深入理解计算机系统", "Randal E. Bryant",
                                        new BigDecimal("139.00"), 50,
                                        "计算机科学领域的经典教材，从程序员视角深入解析计算机系统。", c1,
                                        "/covers/csapp.png");
                        addBookIfMissing(booksToSave, existingTitles, "三体", "刘慈欣", new BigDecimal("68.00"), 200,
                                        "中国科幻基石之作，讲述人类与三体文明的博弈。", c4,
                                        "/covers/three-body.png");
                        addBookIfMissing(booksToSave, existingTitles, "百年孤独", "加西亚·马尔克斯", new BigDecimal("55.00"), 80,
                                        "魔幻现实主义文学代表作，描写布恩迪亚家族七代人的传奇故事。", c2,
                                        "/covers/hundred-years.png");
                        addBookIfMissing(booksToSave, existingTitles, "明朝那些事儿", "当年明月", new BigDecimal("198.00"), 80,
                                        "全景式展现明朝三百年的历史风云，通俗易懂的历史巨著。", c3,
                                        "/covers/ming-dynasty.png");
                        addBookIfMissing(booksToSave, existingTitles, "活着", "余华", new BigDecimal("28.00"), 150,
                                        "讲述了人如何去承受巨大的苦难，讲述了眼泪的丰富和宽广。", c2,
                                        "/covers/alive.png");
                        addBookIfMissing(booksToSave, existingTitles, "算法导论", "Thomas H. Cormen",
                                        new BigDecimal("128.00"), 60,
                                        "计算机算法领域的标准教材，被誉为算法领域的'圣经'。", c1,
                                        "/covers/intro-algorithms.png");
                        addBookIfMissing(booksToSave, existingTitles, "人类简史", "尤瓦尔·赫拉利", new BigDecimal("68.00"), 120,
                                        "从认知革命到科学革命，全景式回顾人类历史。", c3,
                                        "/covers/sapiens.png");
                        addBookIfMissing(booksToSave, existingTitles, "万历十五年", "黄仁宇", new BigDecimal("45.00"), 90,
                                        "通过对万历十五年几个关键人物的描述，揭示大明王朝的兴衰秘密。", c3,
                                        "/covers/wanli.png");
                        addBookIfMissing(booksToSave, existingTitles, "银河帝国", "阿西莫夫", new BigDecimal("299.00"), 30,
                                        "科幻文学界的诺贝尔奖级作品，讲述人类未来两万年的历史。", c4,
                                        "/covers/foundation.png");
                        addBookIfMissing(booksToSave, existingTitles, "Python编程：从入门到实践", "Eric Matthes",
                                        new BigDecimal("89.00"), 200,
                                        "最畅销的 Python 编程教程，适合所有层次的读者。", c1,
                                        "/covers/python-crash.png");
                        addBookIfMissing(booksToSave, existingTitles, "代码整洁之道", "Robert C. Martin",
                                        new BigDecimal("79.00"), 140,
                                        "软件工程经典读物，讲解如何写出清晰、可维护的代码。", c1,
                                        "/covers/clean-code.png");
                        addBookIfMissing(booksToSave, existingTitles, "设计模式", "Erich Gamma", new BigDecimal("99.00"),
                                        70,
                                        "面向对象设计模式经典书籍，介绍 23 种设计模式。", c1,
                                        "/covers/design-patterns.png");
                        addBookIfMissing(booksToSave, existingTitles, "时间简史", "史蒂芬·霍金", new BigDecimal("56.00"), 110,
                                        "通俗物理学经典，探索宇宙起源与时间的奥秘。", c4,
                                        "/covers/brief-history.png");
                        addBookIfMissing(booksToSave, existingTitles, "白夜行", "东野圭吾", new BigDecimal("49.00"), 130,
                                        "推理与人性并重的畅销小说，故事结构精巧。", c2,
                                        "/covers/white-night.png");
                        addBookIfMissing(booksToSave, existingTitles, "解忧杂货店", "东野圭吾", new BigDecimal("42.00"), 180,
                                        "温暖治愈的故事，展示人心的善意与救赎。", c2,
                                        "/covers/convenience-store.png");
                        addBookIfMissing(booksToSave, existingTitles, "史记", "司马迁", new BigDecimal("158.00"), 60,
                                        "中国史学经典之作，纪传体史书的开山之作。", c3,
                                        "/covers/shiji.png");
                        addBookIfMissing(booksToSave, existingTitles, "秦汉史", "吕思勉", new BigDecimal("68.00"), 90,
                                        "系统梳理秦汉时期历史事件与制度演变。", c3,
                                        "/covers/qinhan.png");
                        addBookIfMissing(booksToSave, existingTitles, "银河系漫游指南", "道格拉斯·亚当斯", new BigDecimal("59.00"),
                                        100,
                                        "充满想象力与幽默的科幻经典。", c4,
                                        "/covers/hitchhiker.png");
                        addBookIfMissing(booksToSave, existingTitles, "机器学习实战", "Peter Harrington",
                                        new BigDecimal("88.00"), 75,
                                        "通过实践案例掌握机器学习核心算法。", c1,
                                        "/covers/ml-action.png");

                        addBookIfMissing(booksToSave, existingTitles, "Effective Java", "Joshua Bloch",
                                        new BigDecimal("118.00"), 90,
                                        "Java 最佳实践指南，涵盖语言特性与编程规范。", c1,
                                        "/covers/effective-java.png");
                        addBookIfMissing(booksToSave, existingTitles, "Spring Boot 实战", "Craig Walls",
                                        new BigDecimal("92.00"), 120,
                                        "从零搭建 Spring Boot 应用，覆盖常用开发模式与实践。", c1,
                                        "/covers/spring-boot.png");
                        addBookIfMissing(booksToSave, existingTitles, "计算机网络：自顶向下方法", "James F. Kurose",
                                        new BigDecimal("128.00"), 80,
                                        "网络原理经典教材，自顶向下讲解协议与实现。", c1,
                                        "/covers/network-top-down.png");
                        addBookIfMissing(booksToSave, existingTitles, "现代操作系统", "Andrew S. Tanenbaum",
                                        new BigDecimal("135.00"), 65,
                                        "系统讲解操作系统核心概念与实现机制。", c1,
                                        "/covers/modern-os.png");
                        addBookIfMissing(booksToSave, existingTitles, "数据库系统概念", "Abraham Silberschatz",
                                        new BigDecimal("129.00"), 70,
                                        "数据库理论与实践结合的经典教材。", c1,
                                        "/covers/db-concepts.png");
                        addBookIfMissing(booksToSave, existingTitles, "黑客与画家", "Paul Graham", new BigDecimal("66.00"),
                                        150,
                                        "关于创业、编程与思考方式的随笔集。", c1,
                                        "/covers/hackers-painters.png");

                        addBookIfMissing(booksToSave, existingTitles, "追风筝的人", "卡勒德·胡赛尼", new BigDecimal("45.00"), 160,
                                        "关于友情、救赎与成长的动人故事。", c2,
                                        "/covers/kite-runner.png");
                        addBookIfMissing(booksToSave, existingTitles, "平凡的世界", "路遥", new BigDecimal("98.00"), 110,
                                        "以普通人的奋斗史描绘时代变迁。", c2,
                                        "/covers/ordinary-world.png");
                        addBookIfMissing(booksToSave, existingTitles, "围城", "钱钟书", new BigDecimal("39.00"), 140,
                                        "以幽默笔触刻画婚姻与人生的围城。", c2,
                                        "/covers/fortress-besieged.png");
                        addBookIfMissing(booksToSave, existingTitles, "红楼梦", "曹雪芹", new BigDecimal("86.00"), 100,
                                        "中国古典文学巅峰之作，描绘家族兴衰与人情世态。", c2,
                                        "/covers/dream-red-mansion.png");
                        addBookIfMissing(booksToSave, existingTitles, "被讨厌的勇气", "岸见一郎", new BigDecimal("45.00"), 160,
                                        "以对话形式介绍阿德勒心理学的核心观点。", c2,
                                        "/covers/courage-disliked.png");

                        addBookIfMissing(booksToSave, existingTitles, "枪炮、病菌与钢铁", "贾雷德·戴蒙德", new BigDecimal("78.00"),
                                        95,
                                        "从宏观视角解释人类社会发展差异的成因。", c3,
                                        "/covers/guns-germs.png");
                        addBookIfMissing(booksToSave, existingTitles, "万物简史", "比尔·布莱森", new BigDecimal("72.00"), 120,
                                        "以通俗语言讲述科学史与自然奥秘。", c3,
                                        "/covers/short-history.png");
                        addBookIfMissing(booksToSave, existingTitles, "中国历代政治得失", "钱穆", new BigDecimal("46.00"), 130,
                                        "透视中国政治制度的演变与得失。", c3,
                                        "/covers/china-politics.png");

                        addBookIfMissing(booksToSave, existingTitles, "沙丘", "弗兰克·赫伯特", new BigDecimal("88.00"), 70,
                                        "史诗级科幻巨作，描绘沙漠星球上的权力与信仰。", c4,
                                        "/covers/dune.png");
                        addBookIfMissing(booksToSave, existingTitles, "基地", "阿西莫夫", new BigDecimal("66.00"), 85,
                                        "经典科幻系列开篇，讲述心理史学与文明兴衰。", c4,
                                        "/covers/foundation-empire.png");
                        addBookIfMissing(booksToSave, existingTitles, "雪崩", "尼尔·斯蒂芬森", new BigDecimal("79.00"), 80,
                                        "赛博朋克经典，描绘虚拟世界与现实秩序的碰撞。", c4,
                                        "/covers/snow-crash.png");

                        addBookIfMissing(booksToSave, existingTitles, "社会心理学", "戴维·迈尔斯", new BigDecimal("88.00"), 90,
                                        "社会心理学入门经典，解释群体影响与个体行为。", c5,
                                        "/covers/social-psychology.png");
                        addBookIfMissing(booksToSave, existingTitles, "自控力", "凯利·麦格尼格尔", new BigDecimal("49.00"), 150,
                                        "结合心理学与神经科学，提升自我控制能力。", c5,
                                        "/covers/willpower.png");

                        addBookIfMissing(booksToSave, existingTitles, "经济学原理", "N. Gregory Mankiw",
                                        new BigDecimal("118.00"), 70,
                                        "现代经济学经典教材，系统讲解供需与宏观经济。", c6,
                                        "/covers/economics-principles.png");
                        addBookIfMissing(booksToSave, existingTitles, "原则", "瑞·达利欧", new BigDecimal("88.00"), 120,
                                        "桥水基金创始人总结的工作与生活原则。", c6,
                                        "/covers/principles.png");

                        addBookIfMissing(booksToSave, existingTitles, "苏菲的世界", "乔斯坦·贾德", new BigDecimal("59.00"), 120,
                                        "以小说形式讲述西方哲学史。", c7,
                                        "/covers/sophies-world.png");
                        addBookIfMissing(booksToSave, existingTitles, "存在与时间", "马丁·海德格尔", new BigDecimal("99.00"), 40,
                                        "20 世纪哲学重要著作，探讨存在的意义。", c7,
                                        "/covers/being-time.png");

                        addBookIfMissing(booksToSave, existingTitles, "艺术的故事", "E. H. Gombrich",
                                        new BigDecimal("108.00"), 65,
                                        "经典艺术史入门读物，覆盖西方艺术发展。", c8,
                                        "/covers/story-of-art.png");
                        addBookIfMissing(booksToSave, existingTitles, "写给大家看的设计书", "Robin Williams",
                                        new BigDecimal("59.00"), 110,
                                        "以易懂方式讲解设计原则与排版。", c8,
                                        "/covers/non-designers.png");

                        addBookIfMissing(booksToSave, existingTitles, "给教师的建议", "苏霍姆林斯基", new BigDecimal("42.00"), 130,
                                        "教育学经典著作，聚焦教学实践与学生成长。", c9,
                                        "/covers/teachers-advice.png");
                        addBookIfMissing(booksToSave, existingTitles, "教育心理学", "安妮·斯拉文", new BigDecimal("78.00"), 95,
                                        "系统介绍教育心理学理论与教学应用。", c9,
                                        "/covers/educational-psychology.png");

                        addBookIfMissing(booksToSave, existingTitles, "高效能人士的七个习惯", "史蒂芬·柯维", new BigDecimal("69.00"),
                                        120,
                                        "经典管理与自我管理读物，强调目标与习惯。", c10,
                                        "/covers/7-habits.png");
                        addBookIfMissing(booksToSave, existingTitles, "从优秀到卓越", "Jim Collins", new BigDecimal("86.00"),
                                        90,
                                        "企业管理经典，研究组织持续卓越的关键因素。", c10,
                                        "/covers/good-to-great.png");

                        if (!booksToSave.isEmpty()) {
                                bookRepository.saveAll(booksToSave);
                        }

                        // Update existing books with local cover images
                        Map<String, String> coverMap = new HashMap<>();
                        coverMap.put("Java 核心技术", "/covers/java-core.png");
                        coverMap.put("深入理解计算机系统", "/covers/csapp.png");
                        coverMap.put("三体", "/covers/three-body.png");
                        coverMap.put("百年孤独", "/covers/hundred-years.png");
                        coverMap.put("明朝那些事儿", "/covers/ming-dynasty.png");
                        coverMap.put("活着", "/covers/alive.png");
                        coverMap.put("算法导论", "/covers/intro-algorithms.png");
                        coverMap.put("人类简史", "/covers/sapiens.png");
                        coverMap.put("万历十五年", "/covers/wanli.png");
                        coverMap.put("银河帝国", "/covers/foundation.png");
                        coverMap.put("Python编程：从入门到实践", "/covers/python-crash.png");
                        coverMap.put("代码整洁之道", "/covers/clean-code.png");
                        coverMap.put("设计模式", "/covers/design-patterns.png");
                        coverMap.put("时间简史", "/covers/brief-history.png");
                        coverMap.put("白夜行", "/covers/white-night.png");
                        coverMap.put("解忧杂货店", "/covers/convenience-store.png");
                        coverMap.put("史记", "/covers/shiji.png");
                        coverMap.put("秦汉史", "/covers/qinhan.png");
                        coverMap.put("银河系漫游指南", "/covers/hitchhiker.png");
                        coverMap.put("机器学习实战", "/covers/ml-action.png");
                        coverMap.put("Effective Java", "/covers/effective-java.png");
                        coverMap.put("Spring Boot 实战", "/covers/spring-boot.png");
                        coverMap.put("计算机网络：自顶向下方法", "/covers/network-top-down.png");
                        coverMap.put("现代操作系统", "/covers/modern-os.png");
                        coverMap.put("数据库系统概念", "/covers/db-concepts.png");
                        coverMap.put("黑客与画家", "/covers/hackers-painters.png");
                        coverMap.put("追风筝的人", "/covers/kite-runner.png");
                        coverMap.put("平凡的世界", "/covers/ordinary-world.png");
                        coverMap.put("围城", "/covers/fortress-besieged.png");
                        coverMap.put("红楼梦", "/covers/dream-red-mansion.png");
                        coverMap.put("被讨厌的勇气", "/covers/courage-disliked.png");
                        coverMap.put("枪炮、病菌与钢铁", "/covers/guns-germs.png");
                        coverMap.put("万物简史", "/covers/short-history.png");
                        coverMap.put("中国历代政治得失", "/covers/china-politics.png");
                        coverMap.put("沙丘", "/covers/dune.png");
                        coverMap.put("基地", "/covers/foundation-empire.png");
                        coverMap.put("雪崩", "/covers/snow-crash.png");
                        coverMap.put("社会心理学", "/covers/social-psychology.png");
                        coverMap.put("自控力", "/covers/willpower.png");
                        coverMap.put("经济学原理", "/covers/economics-principles.png");
                        coverMap.put("原则", "/covers/principles.png");
                        coverMap.put("苏菲的世界", "/covers/sophies-world.png");
                        coverMap.put("存在与时间", "/covers/being-time.png");
                        coverMap.put("艺术的故事", "/covers/story-of-art.png");
                        coverMap.put("写给大家看的设计书", "/covers/non-designers.png");
                        coverMap.put("给教师的建议", "/covers/teachers-advice.png");
                        coverMap.put("教育心理学", "/covers/educational-psychology.png");
                        coverMap.put("高效能人士的七个习惯", "/covers/7-habits.png");
                        coverMap.put("从优秀到卓越", "/covers/good-to-great.png");

                        // Additional books with generated covers
                        coverMap.put("Head First Java", "/covers/head-first-java.png");
                        coverMap.put("JavaScript高级程序设计", "/covers/javascript.png");
                        coverMap.put("Spring实战", "/covers/spring-framework.png");
                        coverMap.put("Linux命令行与shell脚本编程大全", "/covers/linux-shell.png");
                        coverMap.put("C程序设计语言", "/covers/c-programming.png");
                        coverMap.put("数据结构与算法分析", "/covers/data-structures.png");
                        coverMap.put("Android开发艺术探索", "/covers/android-dev.png");
                        coverMap.put("Docker实战", "/covers/docker.png");
                        coverMap.put("Redis设计与实现", "/covers/redis.png");
                        coverMap.put("微服务架构设计模式", "/covers/microservices.png");
                        coverMap.put("2001太空漫游", "/covers/2001-space.png");
                        coverMap.put("挽救计划", "/covers/hail-mary.png");
                        coverMap.put("黑暗森林", "/covers/dark-forest.png");
                        coverMap.put("死神永生", "/covers/death-end.png");

                        List<Book> allBooks = bookRepository.findAll();
                        List<Book> booksToUpdate = new ArrayList<>();
                        for (Book book : allBooks) {
                                String newCover = coverMap.get(book.getTitle());
                                if (newCover != null && !newCover.equals(book.getCoverImage())) {
                                        book.setCoverImage(newCover);
                                        booksToUpdate.add(book);
                                }
                        }
                        if (!booksToUpdate.isEmpty()) {
                                bookRepository.saveAll(booksToUpdate);
                        }

                        // Update books by ID if title matching fails
                        Map<Long, String> coverMapById = new HashMap<>();
                        coverMapById.put(13L, "/covers/head-first-java.png");
                        coverMapById.put(18L, "/covers/javascript.png");
                        coverMapById.put(21L, "/covers/spring-framework.png");
                        coverMapById.put(27L, "/covers/linux-shell.png");
                        coverMapById.put(28L, "/covers/c-programming.png");
                        coverMapById.put(30L, "/covers/data-structures.png");
                        coverMapById.put(34L, "/covers/android-dev.png");
                        coverMapById.put(35L, "/covers/docker.png");
                        coverMapById.put(38L, "/covers/redis.png");
                        coverMapById.put(41L, "/covers/microservices.png");
                        coverMapById.put(44L, "/covers/2001-space.png");
                        coverMapById.put(46L, "/covers/hail-mary.png");
                        coverMapById.put(48L, "/covers/dark-forest.png");
                        coverMapById.put(49L, "/covers/death-end.png");

                        // Refresh entities from DB after previous saveAll to avoid stale state
                        allBooks = bookRepository.findAll();

                        List<Book> booksByIdToUpdate = new ArrayList<>();
                        for (Book book : allBooks) {
                                String newCover = coverMapById.get(book.getId());
                                if (newCover != null && !newCover.equals(book.getCoverImage())) {
                                        book.setCoverImage(newCover);
                                        booksByIdToUpdate.add(book);
                                }
                        }
                        if (!booksByIdToUpdate.isEmpty()) {
                                bookRepository.saveAll(booksByIdToUpdate);
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

                                Order o1 = buildOrder(baseUser, OrderStatus.PENDING, LocalDateTime.now().minusHours(6),
                                                Arrays.asList(buildItem(javaCore, 1), buildItem(python, 2)));
                                addOrderIfValid(orders, o1);

                                Order o2 = buildOrder(alice, OrderStatus.PAID, LocalDateTime.now().minusDays(1),
                                                Arrays.asList(buildItem(threeBody, 1), buildItem(alive, 2)));
                                addOrderIfValid(orders, o2);

                                Order o3 = buildOrder(bob, OrderStatus.SHIPPED, LocalDateTime.now().minusDays(3),
                                                Arrays.asList(buildItem(csApp, 1), buildItem(cleanCode, 1)));
                                addOrderIfValid(orders, o3);

                                Order o4 = buildOrder(charlie, OrderStatus.COMPLETED, LocalDateTime.now().minusDays(5),
                                                Arrays.asList(buildItem(humanHistory, 1), buildItem(whiteNight, 1)));
                                addOrderIfValid(orders, o4);

                                Order o5 = buildOrder(diana, OrderStatus.CANCELLED, LocalDateTime.now().minusDays(2),
                                                Arrays.asList(buildItem(galaxyEmpire, 1)));
                                addOrderIfValid(orders, o5);

                                Order o6 = buildOrder(edward, OrderStatus.PAID, LocalDateTime.now().minusDays(7),
                                                Arrays.asList(buildItem(designPatterns, 1), buildItem(cleanCode, 1)));
                                addOrderIfValid(orders, o6);

                                Order o7 = buildOrder(frank, OrderStatus.SHIPPED, LocalDateTime.now().minusDays(8),
                                                Arrays.asList(buildItem(cosmos, 1), buildItem(wander, 1)));
                                addOrderIfValid(orders, o7);

                                Order o8 = buildOrder(grace, OrderStatus.COMPLETED, LocalDateTime.now().minusDays(10),
                                                Arrays.asList(buildItem(javaCore, 1), buildItem(csApp, 1),
                                                                buildItem(threeBody, 1)));
                                addOrderIfValid(orders, o8);

                                Order o9 = buildOrder(helen, OrderStatus.PENDING, LocalDateTime.now().minusHours(3),
                                                Arrays.asList(buildItem(whiteNight, 1), buildItem(alive, 1)));
                                addOrderIfValid(orders, o9);

                                if (!orders.isEmpty()) {
                                        orderRepository.saveAll(orders);
                                }
                        }

                        // Initialize coupons
                        if (couponRepository.count() == 0) {
                                String[] names = {"新用户专享", "满100减15", "满200减30", "满50减5"};
                                String[] types = {"FIXED", "FULL", "FULL", "FULL"};
                                java.math.BigDecimal[] values = {new java.math.BigDecimal("10"), new java.math.BigDecimal("15"), new java.math.BigDecimal("30"), new java.math.BigDecimal("5")};
                                java.math.BigDecimal[] mins = {java.math.BigDecimal.ZERO, new java.math.BigDecimal("100"), new java.math.BigDecimal("200"), new java.math.BigDecimal("50")};
                                for (int i = 0; i < names.length; i++) {
                                        Coupon c = new Coupon();
                                        c.setName(names[i]);
                                        c.setCode("COUPON" + (1000 + i));
                                        c.setType(types[i]);
                                        c.setValue(values[i]);
                                        c.setMinAmount(mins[i]);
                                        c.setTotalCount(100);
                                        c.setUsedCount(0);
                                        c.setStatus("ACTIVE");
                                        c.setStartTime(java.time.LocalDateTime.now());
                                        c.setEndTime(java.time.LocalDateTime.now().plusMonths(3));
                                        couponRepository.save(c);
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
                        String role) {
                if (userRepository.existsByUsername(username)) {
                        return;
                }
                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode("User@1234"));
                user.setEmail(email);
                user.setFullName(fullName);
                user.setPhoneNumber(phoneNumber);
                user.setRole(role);
                users.add(user);
        }

        private void addDefaultAddressIfMissing(AddressRepository addressRepository,
                        User user,
                        String fullName,
                        String phoneNumber,
                        String address) {
                if (user == null) {
                        return;
                }
                if (addressRepository.countByUserId(user.getId()) > 0) {
                        return;
                }
                Address entry = new Address();
                entry.setUser(user);
                entry.setFullName(fullName);
                entry.setPhoneNumber(phoneNumber);
                entry.setAddress(address);
                entry.setDefault(true);
                addressRepository.save(entry);
        }

        private void addBookIfMissing(List<Book> books,
                        Set<String> existingTitlesLower,
                        String title,
                        String author,
                        BigDecimal price,
                        int stock,
                        String description,
                        Category category,
                        String coverImage) {
                if (title == null) {
                        return;
                }
                String normalizedTitle = title.trim().toLowerCase();
                if (normalizedTitle.isEmpty() || existingTitlesLower.contains(normalizedTitle)) {
                        return;
                }
                Book book = new Book();
                book.setTitle(title);
                book.setAuthor(author);
                book.setPrice(price);
                book.setStock(stock);
                book.setDescription(description);
                book.setCategory(category);
                book.setCoverImage(coverImage);
                books.add(book);
                existingTitlesLower.add(normalizedTitle);
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

        private Order buildOrder(User user, OrderStatus status, LocalDateTime createTime, List<OrderItem> items) {
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

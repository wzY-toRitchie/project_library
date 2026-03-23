-- =============================================
-- 在线书店系统初始化数据脚本
-- 使用方法：mysql -u root -p online_bookstore < data.sql
-- 注意：密码使用BCrypt加密，请使用以下密码登录：
--   admin: Admin@123
--   user: User@1234
--   其他用户: User@1234
-- =============================================

USE online_bookstore;

-- =============================================
-- 1. 初始化用户数据
-- =============================================
-- 密码使用BCrypt加密（Spring Security BCryptPasswordEncoder）
-- admin密码：Admin@123
-- 普通用户密码：User@1234

INSERT INTO users (username, password, email, full_name, phone_number, role, points, create_time) VALUES
('admin', '$2a$10$k3J8fQ40IywoVgxkCyeGjuh0kSaYsHUBC5rj7F0BybmHqgRe2cgr2', 'admin@example.com', NULL, NULL, 'ADMIN', 0, NOW()),
('user', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'user@example.com', NULL, NULL, 'USER', 0, NOW()),
('alice', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'alice@example.com', '陈雨晴', '13911112222', 'USER', 0, NOW()),
('bob', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'bob@example.com', '李明哲', '13722223333', 'USER', 0, NOW()),
('charlie', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'charlie@example.com', '王启航', '13633334444', 'USER', 0, NOW()),
('diana', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'diana@example.com', '周思敏', '13544445555', 'USER', 0, NOW()),
('edward', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'edward@example.com', '郑浩然', '13455556666', 'USER', 0, NOW()),
('frank', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'frank@example.com', '赵子昂', '13366667777', 'USER', 0, NOW()),
('grace', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'grace@example.com', '孙雨珊', '13277778888', 'USER', 0, NOW()),
('helen', '$2a$10$n8EH32/obbcVozMH/ZPu4OWSRGosPqa5vYT2B42j9dybSUqWKdUhq', 'helen@example.com', '刘嘉宁', '13188889999', 'USER', 0, NOW()),
('manager', '$2a$10$k3J8fQ40IywoVgxkCyeGjuh0kSaYsHUBC5rj7F0BybmHqgRe2cgr2', 'manager@example.com', '钱泽宇', '13099990000', 'ADMIN', 0, NOW());

-- =============================================
-- 2. 初始化用户地址数据
-- =============================================
INSERT INTO user_addresses (user_id, full_name, phone_number, address, is_default, create_time) VALUES
(1, '管理员', '18800001111', '北京市海淀区中关村大街', TRUE, NOW()),
(2, '示例用户', '18800002222', '上海市浦东新区世纪大道', TRUE, NOW()),
(3, '陈雨晴', '13911112222', '上海市徐汇区天钥桥路', TRUE, NOW()),
(4, '李明哲', '13722223333', '北京市朝阳区望京街道', TRUE, NOW()),
(5, '王启航', '13633334444', '广州市天河区珠江新城', TRUE, NOW()),
(6, '周思敏', '13544445555', '深圳市南山区科技园', TRUE, NOW()),
(7, '郑浩然', '13455556666', '杭州市西湖区文三路', TRUE, NOW()),
(8, '赵子昂', '13366667777', '成都市高新区天府大道', TRUE, NOW()),
(9, '孙雨珊', '13277778888', '南京市鼓楼区中山路', TRUE, NOW()),
(10, '刘嘉宁', '13188889999', '武汉市武昌区中南路', TRUE, NOW()),
(11, '钱泽宇', '13099990000', '重庆市渝中区解放碑', TRUE, NOW());

-- =============================================
-- 3. 初始化图书分类数据
-- =============================================
INSERT INTO categories (name) VALUES
('计算机'),
('文学'),
('历史'),
('科幻'),
('心理学'),
('经济'),
('哲学'),
('艺术'),
('教育'),
('管理');

-- =============================================
-- 4. 初始化图书数据
-- =============================================
-- 计算机类（13本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('Java核心技术', 'Cay S. Horstmann', 128.00, 100, 'Java编程经典，涵盖Java核心技术和高级特性', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('深入理解计算机系统', 'Randal E. Bryant', 139.00, 85, '计算机系统结构经典，从程序员视角理解计算机', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.9, NOW()),
('算法导论', 'Thomas H. Cormen', 128.00, 75, '算法领域经典教材，全面介绍各类算法', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('Python编程：从入门到实践', 'Eric Matthes', 89.00, 120, 'Python入门经典，适合初学者', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW()),
('代码整洁之道', 'Robert C. Martin', 59.00, 90, '软件开发最佳实践，编写高质量代码', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('设计模式', 'Erich Gamma', 69.00, 80, '面向对象设计模式经典，软件架构必读', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('Head First Java', 'Kathy Sierra', 98.00, 95, '生动有趣的Java学习指南', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.4, NOW()),
('JavaScript高级程序设计', 'Nicholas C. Zakas', 129.00, 88, 'JavaScript权威指南，前端开发必备', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('Spring实战', 'Craig Walls', 108.00, 70, 'Spring框架实战指南', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW()),
('数据库系统概念', 'Abraham Silberschatz', 99.00, 65, '数据库理论与实践经典教材', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('Linux命令行与shell脚本编程大全', 'Richard Blum', 109.00, 78, 'Linux系统管理与自动化运维', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.4, NOW()),
('黑客与画家', 'Paul Graham', 59.00, 110, '硅谷创业教父的思考与实践', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('程序员修炼之道', 'David Thomas', 88.00, 82, '程序员职业发展指南', 1, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW());

-- 文学类（9本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('三体', '刘慈欣', 68.00, 150, '中国科幻里程碑之作，雨果奖获奖作品', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.9, NOW()),
('百年孤独', '加西亚·马尔克斯', 55.00, 95, '魔幻现实主义文学代表作', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('活着', '余华', 35.00, 180, '余华代表作，讲述生命的坚韧', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.9, NOW()),
('白夜行', '东野圭吾', 59.00, 120, '日本推理小说大师代表作', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('小王子', '安托万·德·圣埃克苏佩里', 29.00, 200, '经典童话，关于爱与责任', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('围城', '钱钟书', 39.00, 130, '钱钟书代表作，讽刺小说经典', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW()),
('红楼梦', '曹雪芹', 59.00, 100, '中国古典文学四大名著之一', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.9, NOW()),
('挪威的森林', '村上春树', 45.00, 110, '村上春树代表作', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('追风筝的人', '卡勒德·胡赛尼', 49.00, 140, '关于友谊、背叛与救赎', 2, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW());

-- 历史类（8本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('明朝那些事儿', '当年明月', 268.00, 85, '通俗历史读物，讲述明朝历史', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('人类简史', '尤瓦尔·赫拉利', 68.00, 130, '从动物到上帝，人类发展简史', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('万历十五年', '黄仁宇', 45.00, 95, '以1587年为切入点，剖析明朝政治', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW()),
('枪炮、病菌与钢铁', '贾雷德·戴蒙德', 79.00, 75, '人类社会发展史的另类阐释', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('全球通史', '斯塔夫里阿诺斯', 128.00, 60, '从史前史到21世纪的全球历史', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('中国近代史', '蒋廷黻', 39.00, 110, '中国近代史入门经典', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.4, NOW()),
('史记', '司马迁', 69.00, 80, '中国第一部纪传体通史', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('资治通鉴', '司马光', 198.00, 55, '中国编年体通史巨著', 3, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW());

-- 科幻类（6本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('银河帝国：基地', '艾萨克·阿西莫夫', 55.00, 90, '科幻小说经典，基地系列开篇', 4, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('时间简史', '史蒂芬·霍金', 45.00, 120, '探索宇宙奥秘的科普经典', 4, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW()),
('沙丘', '弗兰克·赫伯特', 79.00, 70, '科幻史诗巨作', 4, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('安德的游戏', '奥森·斯科特·卡德', 49.00, 85, '雨果奖、星云奖双料大奖', 4, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('神经漫游者', '威廉·吉布森', 55.00, 65, '赛博朋克开山之作', 4, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.4, NOW()),
('2001太空漫游', '阿瑟·克拉克', 49.00, 78, '科幻电影原著', 4, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW());

-- 心理学类（2本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('社会心理学', '戴维·迈尔斯', 128.00, 60, '社会心理学经典教材', 5, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('自控力', '凯利·麦格尼格尔', 49.00, 100, '斯坦福大学心理学课程', 5, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW());

-- 经济类（2本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('经济学原理', 'N·格里高利·曼昆', 128.00, 55, '经济学入门经典教材', 6, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW()),
('原则', '瑞·达利欧', 98.00, 90, '桥水基金创始人的生活与工作原则', 6, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW());

-- 哲学类（2本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('苏菲的世界', '乔斯坦·贾德', 55.00, 85, '哲学入门经典', 7, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('存在与时间', '马丁·海德格尔', 89.00, 40, '现象学哲学巨著', 7, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.3, NOW());

-- 艺术类（2本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('艺术的故事', '贡布里希', 128.00, 50, '西方艺术史入门经典', 8, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.7, NOW()),
('写给大家看的设计书', 'Robin Williams', 69.00, 95, '设计入门实用指南', 8, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW());

-- 教育类（2本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('给教师的建议', '苏霍姆林斯基', 45.00, 70, '教育经典著作', 9, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.5, NOW()),
('教育心理学', '约翰·桑切克', 99.00, 45, '教育心理学权威教材', 9, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.4, NOW());

-- 管理类（2本）
INSERT INTO books (title, author, price, stock, description, category_id, cover_image, rating, create_time) VALUES
('高效能人士的七个习惯', '史蒂芬·柯维', 69.00, 110, '个人管理与领导力经典', 10, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.8, NOW()),
('从优秀到卓越', 'Jim Collins', 86.00, 81, '企业管理经典，研究组织持续卓越的关键因素', 10, 'https://img10.360buyimg.com/n1/jfs/t1/162087/7/21395/130705/6146c0a5E34', 4.6, NOW());

-- =============================================
-- 5. 初始化系统设置
-- =============================================
INSERT INTO system_settings (store_name, support_email, support_phone, low_stock_threshold, dashboard_range) VALUES
('在线书店', 'support@bookstore.com', '400-123-4567', 10, '30');

-- =============================================
-- 初始化完成
-- =============================================
SELECT 'Database initialization completed!' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS book_count FROM books;
SELECT COUNT(*) AS category_count FROM categories;

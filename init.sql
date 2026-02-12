-- Create Database
CREATE DATABASE IF NOT EXISTS online_bookstore DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE online_bookstore;

-- Table: categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Table: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'USER', -- 'USER', 'ADMIN'
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: books
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    category_id INT,
    cover_image VARCHAR(255),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- Table: orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table: order_items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
) ENGINE=InnoDB;

-- Insert initial categories
INSERT INTO categories (name) VALUES 
('计算机'), 
('文学'), 
('历史'), 
('科幻');

-- Insert an admin user
-- NOTE: User insertion is handled by DataInitializer.java on application startup to ensure correct password hashing.
-- If you need to manually insert users, please ensure the password hash matches the BCryptPasswordEncoder settings (strength 10).
-- INSERT INTO users (username, password, email, role) VALUES 
-- ('admin', '$2a$10$gqhrslMttQJWnPxaPMIuy.z.p.1.1.1.1.1.1.1.1.1.1.1.1', 'admin@example.com', 'ADMIN');

-- Insert initial books
INSERT INTO books (title, author, price, stock, description, category_id, cover_image) VALUES 
('Java 核心技术', 'Cay S. Horstmann', 119.00, 100, 'Java 领域经典著作，全面覆盖 Java 基础与高级特性。', 1, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg'),
('深入理解计算机系统', 'Randal E. Bryant', 139.00, 50, '计算机科学领域的经典教材，从程序员视角深入解析计算机系统。', 1, 'https://img10.360buyimg.com/n1/jfs/t1/231121/11/1440/150244/6530a61cF0f214f4e/4694460f1661601a.jpg'),
('三体', '刘慈欣', 68.00, 200, '中国科幻基石之作，讲述人类与三体文明的博弈。', 4, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg'),
('百年孤独', '加西亚·马尔克斯', 55.00, 80, '魔幻现实主义文学代表作，描写布恩迪亚家族七代人的传奇故事。', 2, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg'),
('活着', '余华', 28.00, 150, '讲述了人如何去承受巨大的苦难，讲述了眼泪的丰富和宽广。', 2, 'https://img14.360buyimg.com/n1/jfs/t1/110905/23/23247/100536/62441a0eE02022830/6233342.jpg'),
('算法导论', 'Thomas H. Cormen', 128.00, 60, '计算机算法领域的标准教材，被誉为算法领域的''圣经''。', 1, 'https://img12.360buyimg.com/n1/jfs/t1/107755/26/22606/151125/62441a0eE12313123/1231312.jpg'),
('人类简史', '尤瓦尔·赫拉利', 68.00, 120, '从认知革命到科学革命，全景式回顾人类历史。', 3, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg'),
('万历十五年', '黄仁宇', 45.00, 90, '通过对万历十五年几个关键人物的描述，揭示大明王朝的兴衰秘密。', 3, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg'),
('银河帝国', '阿西莫夫', 299.00, 30, '科幻文学界的诺贝尔奖级作品，讲述人类未来两万年的历史。', 4, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg'),
('Python编程：从入门到实践', 'Eric Matthes', 89.00, 200, '最畅销的 Python 编程教程，适合所有层次的读者。', 1, 'https://img14.360buyimg.com/n1/jfs/t1/116905/35/22252/125340/62441a0eE8d88686d/1231312.jpg');

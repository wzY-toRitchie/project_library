package com.bookstore.utils;

import java.sql.*;

public class DatabaseTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/online_bookstore?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true";
        String username = "root";
        String password = "admin";
        
        try (Connection conn = DriverManager.getConnection(url, username, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, username, password, role FROM users LIMIT 10")) {
            
            System.out.println("=== User Data from Database ===");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + 
                                 ", Username: " + rs.getString("username") + 
                                 ", Password: " + rs.getString("password").substring(0, 20) + "..." +
                                 ", Role: " + rs.getString("role"));
            }
            System.out.println("=== End of Data ===");
            
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
        }
    }
}

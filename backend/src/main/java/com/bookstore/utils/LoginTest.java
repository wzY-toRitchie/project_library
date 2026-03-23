package com.bookstore.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.sql.*;

public class LoginTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/online_bookstore?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true";
        String dbUsername = "root";
        String dbPassword = "admin";
        
        String testUsername = "admin";
        String testPassword = "Admin@123";
        
        try (Connection conn = DriverManager.getConnection(url, dbUsername, dbPassword);
             PreparedStatement stmt = conn.prepareStatement("SELECT password FROM users WHERE username = ?")) {
            
            stmt.setString(1, testUsername);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                String encodedPassword = rs.getString("password");
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                
                System.out.println("=== Login Test ===");
                System.out.println("Username: " + testUsername);
                System.out.println("Raw Password: " + testPassword);
                System.out.println("Encoded Password: " + encodedPassword);
                System.out.println("Match Result: " + encoder.matches(testPassword, encodedPassword));
                System.out.println("=== End Test ===");
            } else {
                System.out.println("User not found: " + testUsername);
            }
            
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
        }
    }
}

package com.bookstore.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String rawPassword = "BrandNew@3";
        String encodedPassword = encoder.encode(rawPassword);
        
        System.out.println("=== Password Encoding Test ===");
        System.out.println("Raw Password: " + rawPassword);
        System.out.println("Encoded Password: " + encodedPassword);
        System.out.println("Match Result: " + encoder.matches(rawPassword, encodedPassword));
        System.out.println("=== Test Complete ===");
    }
}

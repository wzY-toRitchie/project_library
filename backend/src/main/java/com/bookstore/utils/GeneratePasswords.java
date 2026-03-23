package com.bookstore.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswords {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=== BCrypt Password Hashes ===");
        System.out.println("Admin@123 -> " + encoder.encode("Admin@123"));
        System.out.println("User@1234 -> " + encoder.encode("User@1234"));
        System.out.println("=== End ===");
    }
}

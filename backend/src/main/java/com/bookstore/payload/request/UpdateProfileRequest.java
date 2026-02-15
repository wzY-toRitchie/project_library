package com.bookstore.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    private String fullName;
    
    private String phoneNumber;
}

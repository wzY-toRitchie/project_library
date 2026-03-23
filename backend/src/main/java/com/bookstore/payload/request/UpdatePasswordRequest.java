package com.bookstore.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    @Size(min = 8, max = 40)
    private String newPassword;
}

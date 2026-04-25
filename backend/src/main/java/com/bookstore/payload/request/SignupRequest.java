package com.bookstore.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "注册请求")
public class SignupRequest {
    @Schema(description = "用户名", example = "user123")
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @Schema(description = "邮箱", example = "user@example.com")
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Schema(description = "密码（至少8位，包含大写字母、小写字母和数字）")
    @NotBlank
    @Size(min = 8, max = 40)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "密码必须包含至少一个大写字母、一个小写字母和一个数字")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

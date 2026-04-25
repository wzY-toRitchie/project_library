package com.bookstore.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(description = "修改密码请求")
@Data
public class UpdatePasswordRequest {
    @Schema(description = "当前密码")
    @NotBlank
    private String currentPassword;

    @Schema(description = "新密码（至少8位，包含大写字母、小写字母和数字）")
    @NotBlank
    @Size(min = 8, max = 40)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "密码必须包含至少一个大写字母、一个小写字母和一个数字")
    private String newPassword;
}

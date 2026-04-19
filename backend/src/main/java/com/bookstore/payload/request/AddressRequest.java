package com.bookstore.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "收货人不能为空")
    private String fullName;

    @NotBlank(message = "手机号不能为空")
    private String phoneNumber;

    @NotBlank(message = "收货地址不能为空")
    private String address;

    private Boolean isDefault;
}

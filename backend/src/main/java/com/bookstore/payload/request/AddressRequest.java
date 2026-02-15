package com.bookstore.payload.request;

import lombok.Data;

@Data
public class AddressRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
    private Boolean isDefault;
}

package com.bookstore.payload.response;

import java.time.LocalDateTime;

public class UserSummaryResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String role;
    private String avatar;
    private LocalDateTime createTime;
    private long addressCount;

    public UserSummaryResponse(Long id, String username, String email, String fullName, String phoneNumber,
            String address, String role, String avatar, LocalDateTime createTime, long addressCount) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.role = role;
        this.avatar = avatar;
        this.createTime = createTime;
        this.addressCount = addressCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public long getAddressCount() {
        return addressCount;
    }

    public void setAddressCount(long addressCount) {
        this.addressCount = addressCount;
    }
}

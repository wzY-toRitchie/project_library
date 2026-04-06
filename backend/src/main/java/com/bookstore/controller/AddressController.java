package com.bookstore.controller;

import com.bookstore.payload.request.AddressRequest;
import com.bookstore.security.services.UserDetailsImpl;
import com.bookstore.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "收货地址", description = "用户收货地址管理接口")
@RestController
@RequestMapping("/api/users/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Operation(summary = "获取收货地址列表", description = "获取当前用户的收货地址列表")
    @GetMapping
    public ResponseEntity<?> getAddresses() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.getAddresses(userId));
    }

    @Operation(summary = "新增收货地址", description = "为当前用户添加一个新的收货地址")
    @PostMapping
    public ResponseEntity<?> createAddress(@Valid @RequestBody AddressRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.createAddress(userId, request));
    }

    @Operation(summary = "更新收货地址", description = "修改指定收货地址的信息")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(
            @Parameter(description = "地址 ID") @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.updateAddress(userId, id, request));
    }

    @Operation(summary = "设为默认地址", description = "将指定收货地址设为默认地址")
    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(
            @Parameter(description = "地址 ID") @PathVariable Long id) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.setDefault(userId, id));
    }

    @Operation(summary = "删除收货地址", description = "删除指定的收货地址")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(
            @Parameter(description = "地址 ID") @PathVariable Long id) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.deleteAddress(userId, id));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}

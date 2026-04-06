package com.bookstore.controller;

import com.bookstore.entity.SystemSetting;
import com.bookstore.payload.request.SystemSettingRequest;
import com.bookstore.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "系统设置", description = "系统全局配置管理接口")
@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @Operation(summary = "获取系统设置", description = "获取当前系统的配置信息，包括店铺名称、库存阈值、AI 推荐配置等")
    @GetMapping
    public SystemSetting getSettings() {
        return systemSettingService.getSettings();
    }

    @Operation(summary = "更新系统设置", description = "修改系统全局配置（管理员）")
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SystemSetting updateSettings(@RequestBody SystemSettingRequest request) {
        return systemSettingService.updateSettings(request);
    }
}

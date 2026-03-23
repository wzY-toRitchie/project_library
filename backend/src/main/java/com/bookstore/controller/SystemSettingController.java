package com.bookstore.controller;

import com.bookstore.entity.SystemSetting;
import com.bookstore.payload.request.SystemSettingRequest;
import com.bookstore.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping
    public SystemSetting getSettings() {
        return systemSettingService.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SystemSetting updateSettings(@RequestBody @NonNull SystemSettingRequest request) {
        return systemSettingService.updateSettings(request);
    }
}

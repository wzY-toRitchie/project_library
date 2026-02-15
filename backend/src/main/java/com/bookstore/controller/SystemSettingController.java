package com.bookstore.controller;

import com.bookstore.entity.SystemSetting;
import com.bookstore.payload.request.SystemSettingRequest;
import com.bookstore.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping
    public SystemSetting getSettings() {
        return systemSettingService.getSettings();
    }

    @PutMapping
    public SystemSetting updateSettings(@RequestBody @NonNull SystemSettingRequest request) {
        return systemSettingService.updateSettings(request);
    }
}

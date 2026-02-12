package com.bookstore.controller;

import com.bookstore.entity.SystemSetting;
import com.bookstore.payload.request.SystemSettingRequest;
import com.bookstore.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping
    public ResponseEntity<SystemSetting> getSettings() {
        return ResponseEntity.ok(systemSettingService.getSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSetting> updateSettings(@RequestBody SystemSettingRequest request) {
        return ResponseEntity.ok(systemSettingService.updateSettings(request));
    }
}

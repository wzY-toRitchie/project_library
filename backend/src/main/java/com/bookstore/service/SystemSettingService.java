package com.bookstore.service;

import com.bookstore.entity.SystemSetting;
import com.bookstore.payload.request.SystemSettingRequest;
import com.bookstore.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
public class SystemSettingService {
    private static final @NonNull Long SETTINGS_ID = 1L;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Cacheable(value = "settings")
    public SystemSetting getSettings() {
        return systemSettingRepository.findById(SETTINGS_ID)
                .orElseGet(() -> systemSettingRepository.save(Objects.requireNonNull(buildDefaultSettings())));
    }

    @CacheEvict(value = "settings", allEntries = true)
    public SystemSetting updateSettings(@NonNull SystemSettingRequest request) {
        SystemSetting settings = systemSettingRepository.findById(SETTINGS_ID)
                .orElseGet(this::buildDefaultSettings);

        if (request.getStoreName() != null) {
            settings.setStoreName(request.getStoreName());
        }
        if (request.getSupportEmail() != null) {
            settings.setSupportEmail(request.getSupportEmail());
        }
        if (request.getSupportPhone() != null) {
            settings.setSupportPhone(request.getSupportPhone());
        }
        if (request.getLowStockThreshold() != null) {
            settings.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getDashboardRange() != null) {
            settings.setDashboardRange(request.getDashboardRange());
        }
        // AI 设置
        if (request.getAiApiKey() != null) {
            settings.setAiApiKey(request.getAiApiKey());
        }
        if (request.getAiModel() != null) {
            settings.setAiModel(request.getAiModel());
        }
        if (request.getAiBaseUrl() != null) {
            settings.setAiBaseUrl(request.getAiBaseUrl());
        }
        if (request.getAiTemperature() != null) {
            settings.setAiTemperature(request.getAiTemperature());
        }
        if (request.getAiMaxTokens() != null) {
            settings.setAiMaxTokens(request.getAiMaxTokens());
        }
        if (request.getAiMock() != null) {
            settings.setAiMock(request.getAiMock());
        }
        return systemSettingRepository.save(Objects.requireNonNull(settings));
    }

    private @NonNull SystemSetting buildDefaultSettings() {
        SystemSetting settings = new SystemSetting();
        settings.setId(SETTINGS_ID);
        settings.setStoreName("JavaBooks");
        settings.setSupportEmail("support@javabooks.com");
        settings.setSupportPhone("400-123-4567");
        settings.setLowStockThreshold(10);
        settings.setDashboardRange("6m");
        return settings;
    }
}

package com.bookstore.controller;

import com.bookstore.payload.request.SystemSettingRequest;
import com.bookstore.payload.response.SystemSettingResponse;
import com.bookstore.service.SystemSettingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemSettingControllerTest {

    @Mock
    private SystemSettingService systemSettingService;

    @InjectMocks
    private SystemSettingController systemSettingController;

    @Test
    void getSettingsReturnsSanitizedResponse() {
        SystemSettingResponse response = new SystemSettingResponse(
                "JavaBooks",
                "support@javabooks.com",
                "400-123-4567",
                10,
                "6m",
                "openrouter/free",
                "https://openrouter.ai/api/v1",
                0.7,
                2000,
                "prompt");
        when(systemSettingService.getPublicSettings()).thenReturn(response);

        SystemSettingResponse result = systemSettingController.getSettings();

        assertThat(result).isSameAs(response);
        assertThat(result.getAiModel()).isEqualTo("openrouter/free");
        verify(systemSettingService).getPublicSettings();
    }

    @Test
    void updateSettingsReturnsSanitizedResponse() {
        SystemSettingRequest request = new SystemSettingRequest();
        request.setAiApiKey("secret-key");

        SystemSettingResponse response = new SystemSettingResponse(
                "JavaBooks",
                "support@javabooks.com",
                "400-123-4567",
                10,
                "6m",
                "openrouter/sonnet",
                "https://openrouter.ai/api/v1",
                0.9,
                3000,
                "prompt");
        when(systemSettingService.updatePublicSettings(request)).thenReturn(response);

        SystemSettingResponse result = systemSettingController.updateSettings(request);

        assertThat(result).isSameAs(response);
        assertThat(result.getAiBaseUrl()).isEqualTo("https://openrouter.ai/api/v1");
        verify(systemSettingService).updatePublicSettings(request);
    }
}

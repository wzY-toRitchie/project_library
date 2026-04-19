package com.bookstore.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class WebConfigUploadPathTest {

    @Test
    void resolveUploadPathUsesConfiguredDirectory() {
        WebConfig webConfig = new WebConfig();
        ReflectionTestUtils.setField(webConfig, "uploadDir", "custom-uploads");

        Path resolvedPath = webConfig.resolveUploadPath();

        assertThat(resolvedPath).isEqualTo(Path.of("custom-uploads").toAbsolutePath().normalize());
    }
}

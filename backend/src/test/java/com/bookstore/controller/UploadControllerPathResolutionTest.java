package com.bookstore.controller;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class UploadControllerPathResolutionTest {

    @Test
    void resolveUploadRootUsesConfiguredDirectory() {
        UploadController uploadController = new UploadController();
        ReflectionTestUtils.setField(uploadController, "uploadDir", "custom-uploads");

        Path resolvedPath = uploadController.resolveUploadRoot();

        assertThat(resolvedPath).isEqualTo(Path.of("custom-uploads").toAbsolutePath().normalize());
    }

    @Test
    void uploadBookCoverStoresFileUnderConfiguredDirectory() {
        UploadController uploadController = new UploadController();
        Path uploadRoot = Path.of("target", "test-uploads", "controller-path-resolution").toAbsolutePath().normalize();
        ReflectionTestUtils.setField(uploadController, "uploadDir", uploadRoot.toString());
        MockMultipartFile file = new MockMultipartFile("file", "cover.png", "image/png", "demo".getBytes());

        var response = uploadController.uploadBookCover(file);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        String url = response.getBody().get("url");
        assertThat(url).startsWith("/uploads/books/");
        String filename = url.substring("/uploads/books/".length());
        assertThat(uploadRoot.resolve("books").resolve(filename)).exists();
    }
}

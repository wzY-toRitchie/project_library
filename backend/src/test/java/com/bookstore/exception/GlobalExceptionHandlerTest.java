package com.bookstore.exception;

import com.bookstore.payload.response.MessageResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void resourceNotFoundMapsTo404() {
        ResponseEntity<MessageResponse> response =
                handler.handleResourceNotFound(new ResourceNotFoundException("Address not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(404);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("Address not found");
    }

    @Test
    void badRequestMapsTo400() {
        ResponseEntity<MessageResponse> response =
                handler.handleBadRequest(new BadRequestException("invalid request"));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("invalid request");
    }
}

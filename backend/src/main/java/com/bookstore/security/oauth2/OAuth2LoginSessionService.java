package com.bookstore.security.oauth2;

import com.bookstore.payload.response.JwtResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ConditionalOnProperty(name = "app.oauth2.enabled", havingValue = "true")
public class OAuth2LoginSessionService {
    private final Map<String, JwtResponse> sessionStore = new ConcurrentHashMap<>();
    private static final long CODE_EXPIRATION_MS = 60000; // 1 minute

    public String issueCode(JwtResponse jwtResponse) {
        String code = UUID.randomUUID().toString();
        sessionStore.put(code, jwtResponse);

        // Schedule cleanup after expiration
        new Thread(() -> {
            try {
                Thread.sleep(CODE_EXPIRATION_MS);
                sessionStore.remove(code);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return code;
    }

    public JwtResponse consumeCode(String code) {
        return sessionStore.remove(code);
    }
}

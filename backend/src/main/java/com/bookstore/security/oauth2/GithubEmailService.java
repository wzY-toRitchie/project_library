package com.bookstore.security.oauth2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "app.oauth2.enabled", havingValue = "true")
public class GithubEmailService {
    private static final Logger logger = LoggerFactory.getLogger(GithubEmailService.class);
    private static final String GITHUB_EMAIL_API = "https://api.github.com/user/emails";

    private final RestTemplate restTemplate;

    public GithubEmailService() {
        this.restTemplate = new RestTemplate();
    }

    public String fetchPrimaryVerifiedEmail(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(
                    GITHUB_EMAIL_API,
                    HttpMethod.GET,
                    entity,
                    List.class
            );

            if (response.getBody() != null) {
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        Map<String, Object> emailData = (Map<String, Object>) item;
                        Boolean primary = (Boolean) emailData.get("primary");
                        Boolean verified = (Boolean) emailData.get("verified");
                        String email = (String) emailData.get("email");

                        if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified) && email != null) {
                            return email;
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to fetch GitHub email", e);
        }
        return null;
    }
}

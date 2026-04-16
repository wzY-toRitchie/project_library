package com.bookstore;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:oauth2-disabled-startup-test;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "app.oauth2.enabled=false",
        "app.oauth2.github.client-id=disabled-test-client-id",
        "app.oauth2.github.client-secret=disabled-test-client-secret",
        "app.jwtSecret=VGhpc0lzQVRlc3RTZWNyZXRLZXlGb3JKV1RBbmRJdE11c3RCZUxvbmdFbm91Z2g=",
        "app.jwtExpirationMs=3600000"
})
class OAuth2DisabledStartupTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void contextLoadsWithoutOauthClientRegistrationWhenOauthIsDisabled() {
        assertNotNull(applicationContext);
    }
}

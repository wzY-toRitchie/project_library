package com.bookstore.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.oauth2.enabled=false",
        "app.jwtSecret=RGV2ZWxvcG1lbnRLZXlGb3JKYXZhQm9va3N0b3JlMjAyNA==",
        "spring.datasource.url=jdbc:h2:mem:securityconfigtest;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAllReviewsRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getReviewsByBookRemainsPublic() throws Exception {
        mockMvc.perform(get("/api/reviews/book/1"))
                .andExpect(status().isOk());
    }
}

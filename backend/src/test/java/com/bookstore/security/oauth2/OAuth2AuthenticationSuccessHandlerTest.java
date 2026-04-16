package com.bookstore.security.oauth2;

import com.bookstore.entity.User;
import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class OAuth2AuthenticationSuccessHandlerTest {

    @Test
    void redirectsWithTokenQueryParam() throws Exception {
        OAuth2AccountService accountService = Mockito.mock(OAuth2AccountService.class);
        JwtUtils jwtUtils = Mockito.mock(JwtUtils.class);
        GithubEmailService githubEmailService = Mockito.mock(GithubEmailService.class);

        OAuth2AuthenticationSuccessHandler handler = new OAuth2AuthenticationSuccessHandler(
                accountService,
                jwtUtils,
                null,
                githubEmailService
        );

        var redirectField = OAuth2AuthenticationSuccessHandler.class.getDeclaredField("authorizedRedirectUri");
        redirectField.setAccessible(true);
        redirectField.set(handler, "http://localhost:5173/oauth/callback");

        User user = new User();
        user.setId(1L);
        user.setUsername("oauth_user");
        user.setEmail("oauth@example.com");
        user.setRole("USER");

        when(accountService.loadOrCreateGithubUser(any())).thenReturn(user);
        when(jwtUtils.generateJwtToken(any(UserDetailsImpl.class))).thenReturn("mock.jwt.token");

        OAuth2User principal = new DefaultOAuth2User(List.of(() -> "ROLE_USER"), Map.of(
                "id", "123",
                "name", "OAuth User",
                "email", "oauth@example.com"
        ), "id");

        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, authentication);

        String location = response.getHeader("Location");
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FOUND);
        assertThat(location).contains("/oauth/callback");
        assertThat(location).contains("token=mock.jwt.token");
    }
}

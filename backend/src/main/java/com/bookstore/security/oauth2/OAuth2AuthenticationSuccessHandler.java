package com.bookstore.security.oauth2;

import com.bookstore.entity.User;
import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "app.oauth2.enabled", havingValue = "true")
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    private static final String OAUTH_EMAIL_REQUIRED = "OAUTH_EMAIL_REQUIRED";
    private static final String OAUTH_LOGIN_FAILED = "OAUTH_LOGIN_FAILED";

    private final OAuth2AccountService oAuth2AccountService;
    private final JwtUtils jwtUtils;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final GithubEmailService githubEmailService;

    @Value("${app.oauth2.authorized-redirect-uri}")
    private String authorizedRedirectUri;

    public OAuth2AuthenticationSuccessHandler(
            OAuth2AccountService oAuth2AccountService,
            JwtUtils jwtUtils,
            OAuth2AuthorizedClientService authorizedClientService,
            GithubEmailService githubEmailService
    ) {
        this.oAuth2AccountService = oAuth2AccountService;
        this.jwtUtils = jwtUtils;
        this.authorizedClientService = authorizedClientService;
        this.githubEmailService = githubEmailService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
            String profileEmail = attributes.get("email") == null ? null : String.valueOf(attributes.get("email"));

            if ((profileEmail == null || profileEmail.isBlank()) && authentication instanceof OAuth2AuthenticationToken oauthToken) {
                OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                        oauthToken.getAuthorizedClientRegistrationId(),
                        oauthToken.getName()
                );
                if (authorizedClient != null && authorizedClient.getAccessToken() != null) {
                    String githubEmail = githubEmailService.fetchPrimaryVerifiedEmail(authorizedClient.getAccessToken().getTokenValue());
                    if (githubEmail != null && !githubEmail.isBlank()) {
                        attributes.put("email", githubEmail);
                    }
                }
            }

            User user = oAuth2AccountService.loadOrCreateGithubUser(new GithubOAuth2UserInfo(attributes));
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            String token = jwtUtils.generateJwtToken(userDetails);
            String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
                    .queryParam("token", token)
                    .build()
                    .encode()
                    .toUriString();

            response.sendRedirect(targetUrl);
        } catch (IllegalArgumentException ex) {
            logger.warn("OAuth2 account handling failed: {}", ex.getMessage());
            String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
                    .queryParam("error", OAUTH_EMAIL_REQUIRED)
                    .build()
                    .encode()
                    .toUriString();
            response.sendRedirect(targetUrl);
        } catch (Exception ex) {
            logger.error("OAuth2 login failed", ex);
            String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
                    .queryParam("error", OAUTH_LOGIN_FAILED)
                    .build()
                    .encode()
                    .toUriString();
            response.sendRedirect(targetUrl);
        }
    }
}

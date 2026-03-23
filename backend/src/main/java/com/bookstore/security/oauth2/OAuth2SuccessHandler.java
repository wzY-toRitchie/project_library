package com.bookstore.security.oauth2;

import com.bookstore.security.jwt.JwtUtils;
import com.bookstore.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth/callback}")
    private String redirectUri;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 生成 JWT
        String jwt = jwtUtils.generateJwtToken(authentication);

        logger.info("OAuth2 登录成功: userId={}, username={}", userDetails.getId(), userDetails.getUsername());

        // 构建重定向 URL
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", jwt)
                .queryParam("userId", userDetails.getId())
                .queryParam("username", URLEncoder.encode(userDetails.getUsername(), StandardCharsets.UTF_8))
                .queryParam("email", userDetails.getEmail() != null ?
                    URLEncoder.encode(userDetails.getEmail(), StandardCharsets.UTF_8) : "")
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}

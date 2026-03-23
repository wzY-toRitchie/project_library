package com.bookstore.security.oauth2;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId) {
            case "github" -> new GithubOAuth2UserInfo(attributes);
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "gitee" -> new GiteeOAuth2UserInfo(attributes);
            case "xiaomi" -> new XiaomiOAuth2UserInfo(attributes);
            default -> throw new IllegalArgumentException("不支持的 OAuth 提供商: " + registrationId);
        };
    }
}

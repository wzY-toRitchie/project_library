package com.bookstore.security.oauth2;

import java.util.Map;

public class GithubOAuth2UserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProviderId() {
        return attributes.get("id").toString();
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("avatar_url");
    }
}

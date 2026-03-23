package com.bookstore.security.oauth2;

import java.util.Map;

public class XiaomiOAuth2UserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;

    public XiaomiOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProviderId() {
        return (String) attributes.get("union_id");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getName() {
        return (String) attributes.get("miliaoNick");
    }

    @Override
    public String getAvatarUrl() {
        return (String) attributes.get("miliaoIconOrig");
    }
}

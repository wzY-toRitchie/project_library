package com.bookstore.security.oauth2;

import java.util.Map;

public interface OAuth2UserInfo {
    String getProviderId();
    String getEmail();
    String getName();
    String getAvatarUrl();
}

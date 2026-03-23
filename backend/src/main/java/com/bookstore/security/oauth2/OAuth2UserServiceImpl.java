package com.bookstore.security.oauth2;

import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        logger.info("OAuth2 登录: provider={}", registrationId);

        // 提取用户信息
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, attributes);

        // 查找或创建本地用户
        User user = userRepository.findByProviderAndProviderId(registrationId, userInfo.getProviderId())
                .orElseGet(() -> createNewUser(registrationId, userInfo));

        return UserDetailsImpl.build(user, attributes);
    }

    private User createNewUser(String provider, OAuth2UserInfo userInfo) {
        User user = new User();
        user.setProvider(provider);
        user.setProviderId(userInfo.getProviderId());
        user.setUsername(generateUniqueUsername(userInfo.getName()));
        user.setEmail(userInfo.getEmail() != null ? userInfo.getEmail() : generateTempEmail(provider, userInfo.getProviderId()));
        user.setFullName(userInfo.getName());
        user.setAvatarUrl(userInfo.getAvatarUrl());
        user.setPassword(null);
        user.setRole("USER");

        logger.info("创建新 OAuth 用户: provider={}, username={}", provider, user.getUsername());
        return userRepository.save(user);
    }

    private String generateUniqueUsername(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "user_" + UUID.randomUUID().toString().substring(0, 8);
        }

        // 清理用户名
        String baseName = name.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5]", "_").toLowerCase();
        if (baseName.length() > 20) {
            baseName = baseName.substring(0, 20);
        }

        // 检查是否已存在
        if (!userRepository.existsByUsername(baseName)) {
            return baseName;
        }

        // 添加随机后缀
        return baseName + "_" + UUID.randomUUID().toString().substring(0, 6);
    }

    private String generateTempEmail(String provider, String providerId) {
        return provider + "_" + providerId + "@oauth.temp";
    }
}

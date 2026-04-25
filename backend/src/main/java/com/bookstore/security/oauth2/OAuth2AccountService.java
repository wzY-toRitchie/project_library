package com.bookstore.security.oauth2;

import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.oauth2.enabled", havingValue = "true")
public class OAuth2AccountService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OAuth2AccountService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User loadOrCreateGithubUser(GithubOAuth2UserInfo userInfo) {
        String email = userInfo.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required for OAuth2 login");
        }

        return userRepository.findByEmail(email)
                .map(user -> refreshOAuth2Profile(user, userInfo))
                .orElseGet(() -> createNewOAuth2User(userInfo));
    }

    private User refreshOAuth2Profile(User user, GithubOAuth2UserInfo userInfo) {
        boolean changed = false;
        if ((user.getAvatar() == null || user.getAvatar().isBlank())
                && userInfo.getAvatarUrl() != null
                && !userInfo.getAvatarUrl().isBlank()) {
            user.setAvatar(userInfo.getAvatarUrl());
            changed = true;
        }
        if ((user.getFullName() == null || user.getFullName().isBlank())
                && userInfo.getName() != null
                && !userInfo.getName().isBlank()) {
            user.setFullName(userInfo.getName());
            changed = true;
        }
        return changed ? userRepository.save(user) : user;
    }

    private User createNewOAuth2User(GithubOAuth2UserInfo userInfo) {
        User user = new User();
        user.setUsername(generateUniqueUsername(userInfo.getName(), userInfo.getEmail()));
        user.setEmail(userInfo.getEmail());
        user.setFullName(userInfo.getName());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole("USER");
        user.setAvatar(userInfo.getAvatarUrl());

        return userRepository.save(user);
    }

    private String generateUniqueUsername(String name, String email) {
        String baseUsername = name != null && !name.isBlank()
                ? name.toLowerCase().replaceAll("\\s+", "_")
                : email.split("@")[0];

        String username = baseUsername;
        int counter = 1;
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + "_" + counter++;
        }
        return username;
    }
}

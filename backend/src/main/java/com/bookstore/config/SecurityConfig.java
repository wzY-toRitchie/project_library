package com.bookstore.config;

import com.bookstore.security.jwt.AuthEntryPointJwt;
import com.bookstore.security.jwt.AuthTokenFilter;
import com.bookstore.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.bookstore.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.bookstore.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService; // Custom user details service

    @Autowired
    AuthEntryPointJwt unauthorizedHandler;

    @Value("${app.oauth2.enabled:false}")
    private boolean oauth2Enabled;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            ObjectProvider<OAuth2AuthenticationSuccessHandler> successHandlerProvider,
            ObjectProvider<OAuth2AuthenticationFailureHandler> failureHandlerProvider
    ) throws Exception {
        // CORS 配置由 WebConfig 统一管理，Security 使用默认的 CorsFilter
        http.csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/coupons").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/settings").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/book/**").permitAll()
                        .requestMatchers("/api/payment/notify").permitAll()
                        .requestMatchers("/api/uploads/**").hasRole("ADMIN")
                        .requestMatchers("/api/books/**").hasRole("ADMIN")
                        .requestMatchers("/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/settings").hasRole("ADMIN")
                        .requestMatchers("/api/export/**").hasRole("ADMIN")
                        .requestMatchers("/api/dashboard/**").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/orders").hasRole("ADMIN")
                        .requestMatchers("/api/coupons/admin").hasRole("ADMIN")
                        .anyRequest().authenticated());

        OAuth2AuthenticationSuccessHandler successHandler = successHandlerProvider.getIfAvailable();
        OAuth2AuthenticationFailureHandler failureHandler = failureHandlerProvider.getIfAvailable();
        if (oauth2Enabled && successHandler != null && failureHandler != null) {
            http.oauth2Login(oauth -> oauth
                    .successHandler(successHandler)
                    .failureHandler(failureHandler));
        }

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

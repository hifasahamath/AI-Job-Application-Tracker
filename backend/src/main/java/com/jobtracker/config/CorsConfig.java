package com.jobtracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000,https://*.vercel.app,https://*.railway.app}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> patterns = new java.util.ArrayList<>();
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            patterns.addAll(Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        }

        // Always ensure *.vercel.app, *.railway.app, and localhost are supported even if CORS_ALLOWED_ORIGINS is set to a restricted list
        if (patterns.isEmpty() || patterns.contains("*")) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            if (!patterns.contains("https://*.vercel.app")) {
                patterns.add("https://*.vercel.app");
            }
            if (!patterns.contains("https://*.railway.app")) {
                patterns.add("https://*.railway.app");
            }
            if (!patterns.contains("http://localhost:[*]")) {
                patterns.add("http://localhost:[*]");
            }
            if (!patterns.contains("http://127.0.0.1:[*]")) {
                patterns.add("http://127.0.0.1:[*]");
            }
            configuration.setAllowedOriginPatterns(patterns);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-Forwarded-For"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

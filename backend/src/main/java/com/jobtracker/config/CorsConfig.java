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

        // Support comma-separated list of origins or wildcard patterns (e.g., https://*.vercel.app, *)
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            List<String> origins = Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            if (origins.contains("*") || origins.isEmpty()) {
                configuration.setAllowedOriginPatterns(List.of("*"));
            } else {
                configuration.setAllowedOriginPatterns(origins);
            }
        } else {
            configuration.setAllowedOriginPatterns(List.of("*"));
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

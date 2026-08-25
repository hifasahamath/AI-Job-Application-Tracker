package com.jobtracker.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread-safe rate limiter filter protecting sensitive endpoints against brute-force,
 * resource exhaustion, and AI API quota abuse.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    // Limit configurations per endpoint category:
    // Auth endpoints: 20 requests per minute per IP (prevents brute-force)
    private static final int AUTH_LIMIT_PER_MINUTE = 20;
    // AI Analysis endpoints: 10 requests per minute per IP (prevents Gemini API draining)
    private static final int AI_LIMIT_PER_MINUTE = 10;
    // Document text extraction: 15 requests per minute per IP (prevents CPU exhaustion)
    private static final int EXTRACT_LIMIT_PER_MINUTE = 15;
    // General API: 120 requests per minute per IP
    private static final int GENERAL_LIMIT_PER_MINUTE = 120;

    private final Map<String, RequestBucket> clientBuckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitingFilter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        this.objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        // Skip rate limiting for static/swagger docs/OPTIONS preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/webjars") ||
                path.equals("/api/v1/health") ||
                path.equals("/actuator/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = getClientIdentifier(request);
        int maxAllowed = getLimitForPath(path);
        String bucketKey = clientKey + ":" + getCategoryKey(path);

        long now = Instant.now().getEpochSecond();
        long currentWindow = now / 60; // 1-minute window

        RequestBucket bucket = clientBuckets.compute(bucketKey, (key, existing) -> {
            if (existing == null || existing.window != currentWindow) {
                return new RequestBucket(currentWindow, new AtomicInteger(1));
            } else {
                existing.count.incrementAndGet();
                return existing;
            }
        });

        // Periodic bucket cleanup (every ~1000 requests)
        if (clientBuckets.size() > 5000) {
            cleanupOldBuckets(currentWindow);
        }

        if (bucket.count.get() > maxAllowed) {
            log.warn("Rate limit exceeded for client [{}] on path [{}] - Count: {} / Max: {}",
                    clientKey, path, bucket.count.get(), maxAllowed);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");

            ErrorResponse error = new ErrorResponse(
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "RATE_LIMIT_EXCEEDED",
                    "Too many requests. Please slow down and try again after 60 seconds.",
                    path
            );

            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxAllowed - bucket.count.get())));

        filterChain.doFilter(request, response);
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private int getLimitForPath(String path) {
        if (path.contains("/api/v1/auth/login") || path.contains("/api/v1/auth/register")) {
            return AUTH_LIMIT_PER_MINUTE;
        } else if (path.contains("/api/v1/ai/analyze")) {
            return AI_LIMIT_PER_MINUTE;
        } else if (path.contains("/api/v1/auth/extract-resume")) {
            return EXTRACT_LIMIT_PER_MINUTE;
        }
        return GENERAL_LIMIT_PER_MINUTE;
    }

    private String getCategoryKey(String path) {
        if (path.contains("/api/v1/auth/login") || path.contains("/api/v1/auth/register")) {
            return "auth";
        } else if (path.contains("/api/v1/ai/analyze")) {
            return "ai";
        } else if (path.contains("/api/v1/auth/extract-resume")) {
            return "extract";
        }
        return "general";
    }

    private void cleanupOldBuckets(long currentWindow) {
        clientBuckets.entrySet().removeIf(entry -> entry.getValue().window < currentWindow);
    }

    private static class RequestBucket {
        final long window;
        final AtomicInteger count;

        RequestBucket(long window, AtomicInteger count) {
            this.window = window;
            this.count = count;
        }
    }
}

package com.jobtracker.service;

import com.jobtracker.dto.auth.AuthResponse;
import com.jobtracker.dto.auth.LoginRequest;
import com.jobtracker.dto.auth.RegisterRequest;
import com.jobtracker.dto.auth.UserProfileResponse;
import com.jobtracker.exception.DuplicateResourceException;
import com.jobtracker.model.User;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("developer@example.com");
        testUser.setPasswordHash("hashed_password");
        testUser.setFullName("Jane Developer");
        testUser.setTargetRole("Senior Full Stack Engineer");
        testUser.setSkillsSummary("Java, Spring Boot, React, TypeScript");
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest(
                "newuser@example.com",
                "password123",
                "Jane Doe",
                "Backend Engineer",
                "Java, Spring"
        );

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(tokenProvider.generateTokenFromUser(any(UUID.class), anyString(), anyString())).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("newuser@example.com", response.getEmail());
        assertEquals("Jane Doe", response.getFullName());
        assertEquals("mock-jwt-token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already exists")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "developer@example.com",
                "password123",
                "Jane Developer",
                "Software Engineer",
                "Java"
        );

        when(userRepository.existsByEmail("developer@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate user and return JWT token on login")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("developer@example.com", "password123");
        Authentication mockAuth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(userRepository.findByEmail("developer@example.com")).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateToken(mockAuth)).thenReturn("generated-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("generated-jwt-token", response.getToken());
        assertEquals("developer@example.com", response.getEmail());
        assertEquals(userId, response.getUserId());
    }

    @Test
    @DisplayName("Should fetch user profile by ID")
    void testGetCurrentUserProfile() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        UserProfileResponse profile = authService.getCurrentUserProfile(userId);

        assertNotNull(profile);
        assertEquals(userId, profile.getId());
        assertEquals("developer@example.com", profile.getEmail());
        assertEquals("Jane Developer", profile.getFullName());
        assertEquals("Senior Full Stack Engineer", profile.getTargetRole());
    }
}

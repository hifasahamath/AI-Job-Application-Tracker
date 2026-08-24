package com.jobtracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.auth.AuthResponse;
import com.jobtracker.dto.auth.LoginRequest;
import com.jobtracker.dto.auth.RegisterRequest;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.CustomUserDetailsService;
import com.jobtracker.security.JwtAuthenticationEntryPoint;
import com.jobtracker.security.JwtAuthenticationFilter;
import com.jobtracker.security.JwtTokenProvider;
import com.jobtracker.service.AuthService;
import com.jobtracker.service.ResumeParserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private ResumeParserService resumeParserService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private UserRepository userRepository;

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 201 on valid registration")
    void testRegisterEndpoint() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "candidate@domain.com",
                "securePass123",
                "Alex Candidate",
                "Full Stack Developer",
                "React, Java, SQL"
        );

        AuthResponse authResponse = new AuthResponse(
                "sample-jwt-token",
                UUID.randomUUID(),
                "candidate@domain.com",
                "Alex Candidate",
                "Full Stack Developer"
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("sample-jwt-token"))
                .andExpect(jsonPath("$.data.email").value("candidate@domain.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 200 and token on valid credentials")
    void testLoginEndpoint() throws Exception {
        LoginRequest request = new LoginRequest("candidate@domain.com", "securePass123");

        AuthResponse authResponse = new AuthResponse(
                "sample-jwt-token",
                UUID.randomUUID(),
                "candidate@domain.com",
                "Alex Candidate",
                "Full Stack Developer"
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("sample-jwt-token"));
    }
}

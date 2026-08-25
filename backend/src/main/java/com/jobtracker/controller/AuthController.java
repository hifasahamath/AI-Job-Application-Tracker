package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.auth.*;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.AuthService;
import com.jobtracker.service.ResumeParserService;
import com.jobtracker.service.SupabaseStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, and profile management")
public class AuthController {

    private final AuthService authService;
    private final ResumeParserService resumeParserService;
    private final SupabaseStorageService supabaseStorageService;

    public AuthController(AuthService authService, ResumeParserService resumeParserService,
                          SupabaseStorageService supabaseStorageService) {
        this.authService = authService;
        this.resumeParserService = resumeParserService;
        this.supabaseStorageService = supabaseStorageService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns a JWT bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Validates user credentials and issues a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Returns profile of authenticated user")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserProfileResponse profile = authService.getCurrentUserProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Updates target role, skills summary, and master resume")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse updated = authService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping(value = "/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile picture", description = "Uploads a profile picture to Supabase Storage and saves the URL")
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        String publicUrl = supabaseStorageService.uploadProfilePicture(currentUser.getId(), file);
        UserProfileResponse updated = authService.updateProfilePictureUrl(currentUser.getId(), publicUrl);
        return ResponseEntity.ok(ApiResponse.success("Profile picture uploaded successfully", updated));
    }

    @DeleteMapping("/profile-picture")
    @Operation(summary = "Delete profile picture", description = "Removes the profile picture from storage and clears the URL")
    public ResponseEntity<ApiResponse<UserProfileResponse>> deleteProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        supabaseStorageService.deleteProfilePicture(currentUser.getId());
        UserProfileResponse updated = authService.updateProfilePictureUrl(currentUser.getId(), null);
        return ResponseEntity.ok(ApiResponse.success("Profile picture removed", updated));
    }

    @PostMapping(value = "/extract-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Extract text from CV/Resume file", description = "Extracts clean readable plain text from uploaded PDF, DOCX, or TXT documents")
    public ResponseEntity<ApiResponse<String>> extractResumeText(
            @RequestParam("file") MultipartFile file) {
        String extractedText = resumeParserService.extractText(file);
        return ResponseEntity.ok(ApiResponse.success("Text extracted successfully", extractedText));
    }
}

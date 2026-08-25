package com.jobtracker.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name cannot exceed 255 characters")
    private String fullName;

    @Size(max = 255, message = "Target role cannot exceed 255 characters")
    private String targetRole;

    @Size(max = 5000, message = "Skills summary cannot exceed 5000 characters")
    private String skillsSummary;

    public RegisterRequest() {
    }

    public RegisterRequest(String email, String password, String fullName, String targetRole, String skillsSummary) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.targetRole = targetRole;
        this.skillsSummary = skillsSummary;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getSkillsSummary() {
        return skillsSummary;
    }

    public void setSkillsSummary(String skillsSummary) {
        this.skillsSummary = skillsSummary;
    }
}

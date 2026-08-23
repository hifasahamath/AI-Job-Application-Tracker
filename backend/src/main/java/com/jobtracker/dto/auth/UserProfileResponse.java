package com.jobtracker.dto.auth;

import java.time.Instant;
import java.util.UUID;

public class UserProfileResponse {

    private UUID id;
    private String email;
    private String fullName;
    private String targetRole;
    private String skillsSummary;
    private Instant createdAt;

    public UserProfileResponse() {
    }

    public UserProfileResponse(UUID id, String email, String fullName, String targetRole, String skillsSummary, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.targetRole = targetRole;
        this.skillsSummary = skillsSummary;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

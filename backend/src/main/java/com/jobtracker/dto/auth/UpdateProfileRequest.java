package com.jobtracker.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 255, message = "Full name cannot exceed 255 characters")
    private String fullName;

    @Size(max = 255, message = "Target role cannot exceed 255 characters")
    private String targetRole;

    @Size(max = 5000, message = "Skills summary cannot exceed 5000 characters")
    private String skillsSummary;

    @Size(max = 50000, message = "Resume text cannot exceed 50000 characters")
    private String resumeText;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String targetRole, String skillsSummary) {
        this.fullName = fullName;
        this.targetRole = targetRole;
        this.skillsSummary = skillsSummary;
    }

    public UpdateProfileRequest(String fullName, String targetRole, String skillsSummary, String resumeText) {
        this.fullName = fullName;
        this.targetRole = targetRole;
        this.skillsSummary = skillsSummary;
        this.resumeText = resumeText;
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

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }
}

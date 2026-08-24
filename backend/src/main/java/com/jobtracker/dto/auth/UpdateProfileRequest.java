package com.jobtracker.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {

    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    private String targetRole;
    private String skillsSummary;
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

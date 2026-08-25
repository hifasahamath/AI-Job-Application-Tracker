package com.jobtracker.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class AiAnalysisRequest {

    private UUID applicationId;

    @Size(max = 255, message = "Job title cannot exceed 255 characters")
    private String jobTitle;

    @Size(max = 255, message = "Company name cannot exceed 255 characters")
    private String companyName;

    @NotBlank(message = "Job description cannot be empty")
    @Size(max = 20000, message = "Job description cannot exceed 20000 characters")
    private String jobDescription;

    @Size(max = 20000, message = "Resume text cannot exceed 20000 characters")
    private String resumeText;

    @Size(max = 5000, message = "Skills summary cannot exceed 5000 characters")
    private String skillsSummary;

    public AiAnalysisRequest() {
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }

    public String getSkillsSummary() {
        return skillsSummary;
    }

    public void setSkillsSummary(String skillsSummary) {
        this.skillsSummary = skillsSummary;
    }
}

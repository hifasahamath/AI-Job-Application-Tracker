package com.jobtracker.dto.application;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Priority;
import com.jobtracker.model.WorkLocationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class JobApplicationRequest {

    private UUID companyId;

    // Optional inline company name if creating company on-the-fly
    @Size(max = 255, message = "Company name cannot exceed 255 characters")
    private String companyName;

    @NotBlank(message = "Job title is required")
    @Size(max = 255, message = "Job title cannot exceed 255 characters")
    private String jobTitle;

    @Size(max = 50000, message = "Job description cannot exceed 50000 characters")
    private String jobDescription;

    @Size(max = 50000, message = "Custom resume text cannot exceed 50000 characters")
    private String customResumeText;

    @Size(max = 1000, message = "Job URL cannot exceed 1000 characters")
    private String jobUrl;

    private ApplicationStatus status = ApplicationStatus.SAVED;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @Size(max = 10, message = "Salary currency cannot exceed 10 characters")
    private String salaryCurrency = "USD";

    private WorkLocationType workLocationType = WorkLocationType.REMOTE;

    private LocalDate appliedDate;
    private LocalDate deadline;

    private Priority priority = Priority.MEDIUM;

    public JobApplicationRequest() {
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getCustomResumeText() {
        return customResumeText;
    }

    public void setCustomResumeText(String customResumeText) {
        this.customResumeText = customResumeText;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getSalaryCurrency() {
        return salaryCurrency;
    }

    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }

    public WorkLocationType getWorkLocationType() {
        return workLocationType;
    }

    public void setWorkLocationType(WorkLocationType workLocationType) {
        this.workLocationType = workLocationType;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
}

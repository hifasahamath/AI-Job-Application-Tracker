package com.jobtracker.dto.application;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Priority;
import com.jobtracker.model.WorkLocationType;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class JobApplicationRequest {

    private UUID companyId;

    // Optional inline company name if creating company on-the-fly
    private String companyName;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String jobDescription;
    private String customResumeText;
    private String jobUrl;

    private ApplicationStatus status = ApplicationStatus.SAVED;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
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

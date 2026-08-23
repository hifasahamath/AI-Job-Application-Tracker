package com.jobtracker.dto.application;

import com.jobtracker.dto.ai.AiAnalysisResponse;
import com.jobtracker.dto.company.CompanyResponse;
import com.jobtracker.dto.interview.InterviewResponse;
import com.jobtracker.dto.note.NoteResponse;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Priority;
import com.jobtracker.model.WorkLocationType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class JobApplicationResponse {

    private UUID id;
    private UUID userId;
    private CompanyResponse company;
    private String jobTitle;
    private String jobDescription;
    private String jobUrl;
    private ApplicationStatus status;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private WorkLocationType workLocationType;
    private LocalDate appliedDate;
    private LocalDate deadline;
    private Priority priority;
    private List<InterviewResponse> interviews;
    private List<NoteResponse> notes;
    private AiAnalysisResponse latestAiAnalysis;
    private Integer interviewCount;
    private Integer noteCount;
    private Integer latestMatchScore;
    private Instant createdAt;
    private Instant updatedAt;

    public JobApplicationResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public CompanyResponse getCompany() {
        return company;
    }

    public void setCompany(CompanyResponse company) {
        this.company = company;
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

    public List<InterviewResponse> getInterviews() {
        return interviews;
    }

    public void setInterviews(List<InterviewResponse> interviews) {
        this.interviews = interviews;
    }

    public List<NoteResponse> getNotes() {
        return notes;
    }

    public void setNotes(List<NoteResponse> notes) {
        this.notes = notes;
    }

    public AiAnalysisResponse getLatestAiAnalysis() {
        return latestAiAnalysis;
    }

    public void setLatestAiAnalysis(AiAnalysisResponse latestAiAnalysis) {
        this.latestAiAnalysis = latestAiAnalysis;
    }

    public Integer getInterviewCount() {
        return interviewCount;
    }

    public void setInterviewCount(Integer interviewCount) {
        this.interviewCount = interviewCount;
    }

    public Integer getNoteCount() {
        return noteCount;
    }

    public void setNoteCount(Integer noteCount) {
        this.noteCount = noteCount;
    }

    public Integer getLatestMatchScore() {
        return latestMatchScore;
    }

    public void setLatestMatchScore(Integer latestMatchScore) {
        this.latestMatchScore = latestMatchScore;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

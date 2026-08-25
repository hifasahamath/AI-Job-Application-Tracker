package com.jobtracker.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "ai_analyses")
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private JobApplication application;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "job_description_snippet", columnDefinition = "TEXT")
    private String jobDescriptionSnippet;

    @Column(name = "resume_snippet", columnDefinition = "TEXT")
    private String resumeSnippet;

    @Column(name = "match_score", nullable = false)
    private Integer matchScore;

    @Column(name = "analysis_summary", nullable = false, columnDefinition = "TEXT")
    private String analysisSummary;

    // JSON formatted arrays stored as text/jsonb
    @Column(name = "matching_skills", columnDefinition = "TEXT")
    private String matchingSkills;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(name = "cv_improvements", columnDefinition = "TEXT")
    private String cvImprovements;

    @Column(name = "requirement_analysis", columnDefinition = "TEXT")
    private String requirementAnalysis;

    @Column(name = "preparation_areas", columnDefinition = "TEXT")
    private String preparationAreas;

    @Column(name = "interview_questions", columnDefinition = "TEXT")
    private String interviewQuestions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AnalysisStatus status = AnalysisStatus.COMPLETED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public AiAnalysis() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = AnalysisStatus.COMPLETED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public JobApplication getApplication() {
        return application;
    }

    public void setApplication(JobApplication application) {
        this.application = application;
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

    public String getJobDescriptionSnippet() {
        return jobDescriptionSnippet;
    }

    public void setJobDescriptionSnippet(String jobDescriptionSnippet) {
        this.jobDescriptionSnippet = jobDescriptionSnippet;
    }

    public String getResumeSnippet() {
        return resumeSnippet;
    }

    public void setResumeSnippet(String resumeSnippet) {
        this.resumeSnippet = resumeSnippet;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
    }

    public String getAnalysisSummary() {
        return analysisSummary;
    }

    public void setAnalysisSummary(String analysisSummary) {
        this.analysisSummary = analysisSummary;
    }

    public String getMatchingSkills() {
        return matchingSkills;
    }

    public void setMatchingSkills(String matchingSkills) {
        this.matchingSkills = matchingSkills;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getCvImprovements() {
        return cvImprovements;
    }

    public void setCvImprovements(String cvImprovements) {
        this.cvImprovements = cvImprovements;
    }

    public String getRequirementAnalysis() {
        return requirementAnalysis;
    }

    public void setRequirementAnalysis(String requirementAnalysis) {
        this.requirementAnalysis = requirementAnalysis;
    }

    public String getPreparationAreas() {
        return preparationAreas;
    }

    public void setPreparationAreas(String preparationAreas) {
        this.preparationAreas = preparationAreas;
    }

    public String getInterviewQuestions() {
        return interviewQuestions;
    }

    public void setInterviewQuestions(String interviewQuestions) {
        this.interviewQuestions = interviewQuestions;
    }

    public AnalysisStatus getStatus() {
        return status;
    }

    public void setStatus(AnalysisStatus status) {
        this.status = status;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AiAnalysis that = (AiAnalysis) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

package com.jobtracker.dto.ai;

import com.jobtracker.model.AnalysisStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AiAnalysisResponse {

    private UUID id;
    private UUID userId;
    private UUID applicationId;
    private String jobTitle;
    private String companyName;
    private String jobDescriptionSnippet;
    private String resumeSnippet;
    private Integer matchScore;
    private String analysisSummary;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private List<String> cvImprovements;
    private List<RequirementAnalysisDto> requirementAnalysis;
    private List<PreparationAreaDto> preparationAreas;
    private List<InterviewQuestionDto> interviewQuestions;
    private AnalysisStatus status;
    private Instant createdAt;

    public AiAnalysisResponse() {
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

    public List<String> getMatchingSkills() {
        return matchingSkills;
    }

    public void setMatchingSkills(List<String> matchingSkills) {
        this.matchingSkills = matchingSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<PreparationAreaDto> getPreparationAreas() {
        return preparationAreas;
    }

    public void setPreparationAreas(List<PreparationAreaDto> preparationAreas) {
        this.preparationAreas = preparationAreas;
    }

    public List<InterviewQuestionDto> getInterviewQuestions() {
        return interviewQuestions;
    }

    public void setInterviewQuestions(List<InterviewQuestionDto> interviewQuestions) {
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

    public List<String> getCvImprovements() {
        return cvImprovements;
    }

    public void setCvImprovements(List<String> cvImprovements) {
        this.cvImprovements = cvImprovements;
    }

    public List<RequirementAnalysisDto> getRequirementAnalysis() {
        return requirementAnalysis;
    }

    public void setRequirementAnalysis(List<RequirementAnalysisDto> requirementAnalysis) {
        this.requirementAnalysis = requirementAnalysis;
    }
}

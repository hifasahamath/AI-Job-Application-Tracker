package com.jobtracker.dto.ai;

public class RequirementAnalysisDto {
    private String requirement;
    private String category;
    private String importance;
    private String cvEvidence;
    private String matchStatus;
    private String reasoning;

    public RequirementAnalysisDto() {
    }

    public RequirementAnalysisDto(String requirement, String category, String importance, String cvEvidence, String matchStatus, String reasoning) {
        this.requirement = requirement;
        this.category = category;
        this.importance = importance;
        this.cvEvidence = cvEvidence;
        this.matchStatus = matchStatus;
        this.reasoning = reasoning;
    }

    public String getRequirement() {
        return requirement;
    }

    public void setRequirement(String requirement) {
        this.requirement = requirement;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImportance() {
        return importance;
    }

    public void setImportance(String importance) {
        this.importance = importance;
    }

    public String getCvEvidence() {
        return cvEvidence;
    }

    public void setCvEvidence(String cvEvidence) {
        this.cvEvidence = cvEvidence;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }
}

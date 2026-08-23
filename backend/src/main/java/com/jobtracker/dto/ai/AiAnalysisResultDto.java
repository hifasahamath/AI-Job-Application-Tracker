package com.jobtracker.dto.ai;

import java.util.List;

public class AiAnalysisResultDto {

    private Integer matchScore;
    private String analysisSummary;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private List<PreparationAreaDto> recommendedPreparationAreas;
    private List<InterviewQuestionDto> personalizedInterviewQuestions;

    public AiAnalysisResultDto() {
    }

    public AiAnalysisResultDto(Integer matchScore, String analysisSummary, List<String> matchingSkills,
                               List<String> missingSkills, List<PreparationAreaDto> recommendedPreparationAreas,
                               List<InterviewQuestionDto> personalizedInterviewQuestions) {
        this.matchScore = matchScore;
        this.analysisSummary = analysisSummary;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.recommendedPreparationAreas = recommendedPreparationAreas;
        this.personalizedInterviewQuestions = personalizedInterviewQuestions;
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

    public List<PreparationAreaDto> getRecommendedPreparationAreas() {
        return recommendedPreparationAreas;
    }

    public void setRecommendedPreparationAreas(List<PreparationAreaDto> recommendedPreparationAreas) {
        this.recommendedPreparationAreas = recommendedPreparationAreas;
    }

    public List<InterviewQuestionDto> getPersonalizedInterviewQuestions() {
        return personalizedInterviewQuestions;
    }

    public void setPersonalizedInterviewQuestions(List<InterviewQuestionDto> personalizedInterviewQuestions) {
        this.personalizedInterviewQuestions = personalizedInterviewQuestions;
    }
}

package com.jobtracker.dto.ai;

public class InterviewQuestionDto {

    private String category; // e.g., "Technical", "Behavioral", "System Design", "Architecture"
    private String question;
    private String rationale;
    private String suggestedAnswerTip;

    public InterviewQuestionDto() {
    }

    public InterviewQuestionDto(String category, String question, String rationale, String suggestedAnswerTip) {
        this.category = category;
        this.question = question;
        this.rationale = rationale;
        this.suggestedAnswerTip = suggestedAnswerTip;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }

    public String getSuggestedAnswerTip() {
        return suggestedAnswerTip;
    }

    public void setSuggestedAnswerTip(String suggestedAnswerTip) {
        this.suggestedAnswerTip = suggestedAnswerTip;
    }
}

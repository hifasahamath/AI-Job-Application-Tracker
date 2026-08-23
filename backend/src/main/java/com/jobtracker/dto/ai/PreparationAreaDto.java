package com.jobtracker.dto.ai;

import java.util.List;

public class PreparationAreaDto {

    private String topic;
    private String priority; // "HIGH", "MEDIUM", "LOW"
    private String actionableAdvice;
    private List<String> recommendedResources;

    public PreparationAreaDto() {
    }

    public PreparationAreaDto(String topic, String priority, String actionableAdvice, List<String> recommendedResources) {
        this.topic = topic;
        this.priority = priority;
        this.actionableAdvice = actionableAdvice;
        this.recommendedResources = recommendedResources;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getActionableAdvice() {
        return actionableAdvice;
    }

    public void setActionableAdvice(String actionableAdvice) {
        this.actionableAdvice = actionableAdvice;
    }

    public List<String> getRecommendedResources() {
        return recommendedResources;
    }

    public void setRecommendedResources(List<String> recommendedResources) {
        this.recommendedResources = recommendedResources;
    }
}

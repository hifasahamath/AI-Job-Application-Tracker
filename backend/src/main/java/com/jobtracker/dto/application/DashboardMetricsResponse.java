package com.jobtracker.dto.application;

import com.jobtracker.dto.interview.InterviewResponse;
import com.jobtracker.model.ApplicationStatus;

import java.util.List;
import java.util.Map;

public class DashboardMetricsResponse {

    private long totalApplications;
    private Map<ApplicationStatus, Long> statusCounts;
    private long upcomingInterviewsCount;
    private long totalAiAnalysesCount;
    private Double averageMatchScore;
    private List<JobApplicationResponse> recentApplications;
    private List<InterviewResponse> upcomingInterviews;
    private List<JobApplicationResponse> requiresAttention; // stale or pending follow-ups

    public DashboardMetricsResponse() {
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public Map<ApplicationStatus, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<ApplicationStatus, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public long getUpcomingInterviewsCount() {
        return upcomingInterviewsCount;
    }

    public void setUpcomingInterviewsCount(long upcomingInterviewsCount) {
        this.upcomingInterviewsCount = upcomingInterviewsCount;
    }

    public long getTotalAiAnalysesCount() {
        return totalAiAnalysesCount;
    }

    public void setTotalAiAnalysesCount(long totalAiAnalysesCount) {
        this.totalAiAnalysesCount = totalAiAnalysesCount;
    }

    public Double getAverageMatchScore() {
        return averageMatchScore;
    }

    public void setAverageMatchScore(Double averageMatchScore) {
        this.averageMatchScore = averageMatchScore;
    }

    public List<JobApplicationResponse> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<JobApplicationResponse> recentApplications) {
        this.recentApplications = recentApplications;
    }

    public List<InterviewResponse> getUpcomingInterviews() {
        return upcomingInterviews;
    }

    public void setUpcomingInterviews(List<InterviewResponse> upcomingInterviews) {
        this.upcomingInterviews = upcomingInterviews;
    }

    public List<JobApplicationResponse> getRequiresAttention() {
        return requiresAttention;
    }

    public void setRequiresAttention(List<JobApplicationResponse> requiresAttention) {
        this.requiresAttention = requiresAttention;
    }
}

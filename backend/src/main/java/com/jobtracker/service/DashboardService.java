package com.jobtracker.service;

import com.jobtracker.dto.application.DashboardMetricsResponse;
import com.jobtracker.dto.application.JobApplicationResponse;
import com.jobtracker.dto.interview.InterviewResponse;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.InterviewStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.AiAnalysisRepository;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final JobApplicationService jobApplicationService;
    private final InterviewService interviewService;

    public DashboardService(JobApplicationRepository applicationRepository,
                            InterviewRepository interviewRepository,
                            AiAnalysisRepository aiAnalysisRepository,
                            JobApplicationService jobApplicationService,
                            InterviewService interviewService) {
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.jobApplicationService = jobApplicationService;
        this.interviewService = interviewService;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getDashboardMetrics(UUID userId) {
        DashboardMetricsResponse metrics = new DashboardMetricsResponse();

        long totalApps = applicationRepository.countByUserId(userId);
        metrics.setTotalApplications(totalApps);

        // Status Breakdown
        Map<ApplicationStatus, Long> statusCounts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCounts.put(status, 0L);
        }

        List<Object[]> statusResults = applicationRepository.countApplicationsByStatus(userId);
        for (Object[] row : statusResults) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            statusCounts.put(status, count);
        }
        metrics.setStatusCounts(statusCounts);

        // Upcoming Interviews
        List<InterviewResponse> upcomingInterviews = interviewService.getUpcomingInterviews(userId);
        metrics.setUpcomingInterviews(upcomingInterviews);
        metrics.setUpcomingInterviewsCount(upcomingInterviews.size());

        // Total AI Analyses
        long aiCount = aiAnalysisRepository.countByUserId(userId);
        metrics.setTotalAiAnalysesCount(aiCount);

        // Recent Applications
        List<JobApplicationResponse> recent = applicationRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(jobApplicationService::mapToSummaryResponse)
                .collect(Collectors.toList());
        metrics.setRecentApplications(recent);

        // Opportunities requiring attention:
        // 1. Applications with upcoming deadlines in next 7 days
        // 2. Applied / Screening applications older than 14 days without interview scheduled
        List<JobApplication> allApps = applicationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        LocalDate today = LocalDate.now();
        List<JobApplicationResponse> attentionList = allApps.stream()
                .filter(app -> {
                    boolean deadlineSoon = app.getDeadline() != null &&
                            !app.getDeadline().isBefore(today) &&
                            app.getDeadline().isBefore(today.plusDays(7));
                    boolean isAppliedOrScreening = app.getStatus() == ApplicationStatus.APPLIED || app.getStatus() == ApplicationStatus.SCREENING;
                    boolean isStale = isAppliedOrScreening && app.getAppliedDate() != null && app.getAppliedDate().isBefore(today.minusDays(14));
                    return deadlineSoon || isStale;
                })
                .limit(5)
                .map(jobApplicationService::mapToSummaryResponse)
                .collect(Collectors.toList());
        metrics.setRequiresAttention(attentionList);

        return metrics;
    }
}

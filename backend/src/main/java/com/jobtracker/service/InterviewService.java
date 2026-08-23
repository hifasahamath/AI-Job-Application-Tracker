package com.jobtracker.service;

import com.jobtracker.dto.interview.InterviewRequest;
import com.jobtracker.dto.interview.InterviewResponse;
import com.jobtracker.dto.interview.InterviewStatusUpdateRequest;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Interview;
import com.jobtracker.model.InterviewStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository applicationRepository;

    public InterviewService(InterviewRepository interviewRepository, JobApplicationRepository applicationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByApplication(UUID applicationId, UUID userId) {
        applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        return interviewRepository.findAllByApplicationIdOrderByScheduledAtAsc(applicationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getUpcomingInterviews(UUID userId) {
        return interviewRepository.findUpcomingInterviews(userId, Instant.now(), InterviewStatus.SCHEDULED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewResponse scheduleInterview(InterviewRequest request, UUID userId) {
        JobApplication application = applicationRepository.findByIdAndUserId(request.getApplicationId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + request.getApplicationId()));

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setRoundType(request.getRoundType());
        interview.setRoundNumber(request.getRoundNumber() != null ? request.getRoundNumber() : 1);
        interview.setScheduledAt(request.getScheduledAt());
        interview.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 45);
        interview.setMeetingLink(request.getMeetingLink());
        interview.setInterviewerNames(request.getInterviewerNames());
        interview.setStatus(request.getStatus() != null ? request.getStatus() : InterviewStatus.SCHEDULED);
        interview.setNotes(request.getNotes());

        // If application is in SAVED or APPLIED or SCREENING status, automatically update status to INTERVIEW
        if (application.getStatus() == ApplicationStatus.SAVED ||
            application.getStatus() == ApplicationStatus.APPLIED ||
            application.getStatus() == ApplicationStatus.SCREENING) {
            application.setStatus(ApplicationStatus.INTERVIEW);
            applicationRepository.save(application);
        }

        Interview saved = interviewRepository.save(interview);
        return mapToResponse(saved);
    }

    @Transactional
    public InterviewResponse updateInterview(UUID interviewId, InterviewRequest request, UUID userId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        interview.setRoundType(request.getRoundType());
        if (request.getRoundNumber() != null) {
            interview.setRoundNumber(request.getRoundNumber());
        }
        interview.setScheduledAt(request.getScheduledAt());
        if (request.getDurationMinutes() != null) {
            interview.setDurationMinutes(request.getDurationMinutes());
        }
        interview.setMeetingLink(request.getMeetingLink());
        interview.setInterviewerNames(request.getInterviewerNames());
        if (request.getStatus() != null) {
            interview.setStatus(request.getStatus());
        }
        interview.setNotes(request.getNotes());

        Interview updated = interviewRepository.save(interview);
        return mapToResponse(updated);
    }

    @Transactional
    public InterviewResponse updateInterviewStatus(UUID interviewId, InterviewStatusUpdateRequest request, UUID userId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        interview.setStatus(request.getStatus());
        Interview updated = interviewRepository.save(interview);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteInterview(UUID interviewId, UUID userId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        interviewRepository.delete(interview);
    }

    public InterviewResponse mapToResponse(Interview interview) {
        if (interview == null) return null;
        InterviewResponse response = new InterviewResponse();
        response.setId(interview.getId());
        response.setApplicationId(interview.getApplication().getId());
        response.setJobTitle(interview.getApplication().getJobTitle());
        response.setCompanyName(interview.getApplication().getCompany().getName());
        response.setRoundType(interview.getRoundType());
        response.setRoundNumber(interview.getRoundNumber());
        response.setScheduledAt(interview.getScheduledAt());
        response.setDurationMinutes(interview.getDurationMinutes());
        response.setMeetingLink(interview.getMeetingLink());
        response.setInterviewerNames(interview.getInterviewerNames());
        response.setStatus(interview.getStatus());
        response.setNotes(interview.getNotes());
        response.setCreatedAt(interview.getCreatedAt());
        return response;
    }
}

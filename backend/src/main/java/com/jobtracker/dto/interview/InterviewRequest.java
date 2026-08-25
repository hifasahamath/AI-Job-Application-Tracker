package com.jobtracker.dto.interview;

import com.jobtracker.model.InterviewStatus;
import com.jobtracker.model.RoundType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class InterviewRequest {

    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    @NotNull(message = "Round type is required")
    private RoundType roundType = RoundType.SCREENING;

    @Min(value = 1, message = "Round number must be at least 1")
    @Max(value = 100, message = "Round number cannot exceed 100")
    private Integer roundNumber = 1;

    @NotNull(message = "Scheduled time is required")
    private Instant scheduledAt;

    @Min(value = 5, message = "Duration must be at least 5 minutes")
    @Max(value = 1440, message = "Duration cannot exceed 1440 minutes (24 hours)")
    private Integer durationMinutes = 45;

    @Size(max = 1000, message = "Meeting link cannot exceed 1000 characters")
    private String meetingLink;

    @Size(max = 500, message = "Interviewer names cannot exceed 500 characters")
    private String interviewerNames;

    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Size(max = 10000, message = "Notes cannot exceed 10000 characters")
    private String notes;

    public InterviewRequest() {
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public RoundType getRoundType() {
        return roundType;
    }

    public void setRoundType(RoundType roundType) {
        this.roundType = roundType;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Integer roundNumber) {
        this.roundNumber = roundNumber;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getInterviewerNames() {
        return interviewerNames;
    }

    public void setInterviewerNames(String interviewerNames) {
        this.interviewerNames = interviewerNames;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

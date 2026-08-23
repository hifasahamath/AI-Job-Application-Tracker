package com.jobtracker.dto.interview;

import com.jobtracker.model.InterviewStatus;
import com.jobtracker.model.RoundType;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class InterviewRequest {

    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    @NotNull(message = "Round type is required")
    private RoundType roundType = RoundType.SCREENING;

    private Integer roundNumber = 1;

    @NotNull(message = "Scheduled time is required")
    private Instant scheduledAt;

    private Integer durationMinutes = 45;
    private String meetingLink;
    private String interviewerNames;
    private InterviewStatus status = InterviewStatus.SCHEDULED;
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

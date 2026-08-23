package com.jobtracker.dto.interview;

import com.jobtracker.model.InterviewStatus;
import jakarta.validation.constraints.NotNull;

public class InterviewStatusUpdateRequest {

    @NotNull(message = "Status cannot be null")
    private InterviewStatus status;

    public InterviewStatusUpdateRequest() {
    }

    public InterviewStatusUpdateRequest(InterviewStatus status) {
        this.status = status;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }
}

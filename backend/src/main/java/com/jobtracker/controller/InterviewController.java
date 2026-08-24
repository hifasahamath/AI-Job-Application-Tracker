package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.interview.InterviewRequest;
import com.jobtracker.dto.interview.InterviewResponse;
import com.jobtracker.dto.interview.InterviewStatusUpdateRequest;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interviews")
@Tag(name = "Interviews", description = "Endpoints for scheduling and managing interview rounds and upcoming schedule")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    @Operation(summary = "Get all interviews", description = "Retrieves all scheduled future interviews across all user applications")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getAllInterviews(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<InterviewResponse> interviews = interviewService.getUpcomingInterviews(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming interviews", description = "Retrieves all scheduled future interviews across all user applications")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getUpcomingInterviews(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<InterviewResponse> interviews = interviewService.getUpcomingInterviews(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get interviews for application", description = "Retrieves all interview rounds for a specific job application")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getInterviewsByApplication(
            @PathVariable UUID applicationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<InterviewResponse> interviews = interviewService.getInterviewsByApplication(applicationId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @PostMapping
    @Operation(summary = "Schedule interview", description = "Schedules a new interview round and automatically updates application status")
    public ResponseEntity<ApiResponse<InterviewResponse>> scheduleInterview(
            @Valid @RequestBody InterviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        InterviewResponse response = interviewService.scheduleInterview(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview scheduled successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update interview details", description = "Updates details and timing of an interview round")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateInterview(
            @PathVariable UUID id,
            @Valid @RequestBody InterviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        InterviewResponse response = interviewService.updateInterview(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Interview updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update interview status", description = "Updates interview status (SCHEDULED, COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateInterviewStatus(
            @PathVariable UUID id,
            @Valid @RequestBody InterviewStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        InterviewResponse response = interviewService.updateInterviewStatus(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Interview status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete interview", description = "Cancels and deletes an interview round")
    public ResponseEntity<ApiResponse<Void>> deleteInterview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        interviewService.deleteInterview(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Interview deleted successfully"));
    }
}

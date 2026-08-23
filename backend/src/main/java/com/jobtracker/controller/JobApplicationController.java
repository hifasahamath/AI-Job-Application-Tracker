package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.application.JobApplicationRequest;
import com.jobtracker.dto.application.JobApplicationResponse;
import com.jobtracker.dto.application.StatusUpdateRequest;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Priority;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@Tag(name = "Job Applications", description = "Endpoints for managing job applications, status transitions, and search")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    @Operation(summary = "Get paginated job applications", description = "Retrieves applications with optional status, priority, company and keyword filters")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getApplications(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Page<JobApplicationResponse> result = applicationService.getApplications(
                currentUser.getId(), status, priority, companyId, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all applications as flat list", description = "Retrieves all applications for Kanban board view")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getAllApplications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<JobApplicationResponse> result = applicationService.getAllApplicationsList(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application details", description = "Retrieves detailed application with interviews, notes, and AI analysis")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> getApplicationById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        JobApplicationResponse response = applicationService.getApplicationById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create job application", description = "Creates a new job application and links/creates the company")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> createApplication(
            @Valid @RequestBody JobApplicationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        JobApplicationResponse response = applicationService.createApplication(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job application created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update job application", description = "Updates an existing job application's fields")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateApplication(
            @PathVariable UUID id,
            @Valid @RequestBody JobApplicationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        JobApplicationResponse response = applicationService.updateApplication(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job application updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update application status", description = "Quick status update for Kanban drag and drop transitions")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        JobApplicationResponse response = applicationService.updateStatus(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Application status updated to " + request.getStatus(), response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job application", description = "Deletes a job application and all associated notes/interviews")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        applicationService.deleteApplication(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Job application deleted successfully"));
    }
}

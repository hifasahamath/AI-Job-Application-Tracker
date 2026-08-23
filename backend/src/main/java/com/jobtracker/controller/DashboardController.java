package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.application.DashboardMetricsResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Dashboard & Health", description = "Endpoints for aggregated dashboard analytics and service health checks")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/metrics")
    @Operation(summary = "Get dashboard metrics", description = "Retrieves aggregated metrics including pipeline status counts, upcoming interviews, and applications requiring attention")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getDashboardMetrics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardMetricsResponse metrics = dashboardService.getDashboardMetrics(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Public health check endpoint for WSO2 Gateway and monitoring")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "status", "UP",
                "service", "AI Job Application Tracker REST API",
                "version", "1.0.0"
        )));
    }
}

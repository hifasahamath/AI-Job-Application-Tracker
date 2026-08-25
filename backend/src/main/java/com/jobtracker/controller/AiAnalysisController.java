package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.ai.AiAnalysisRequest;
import com.jobtracker.dto.ai.AiAnalysisResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.GeminiAiService;
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
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Job Analysis", description = "Endpoints for Gemini AI job matching, skills gap analysis, and interview question preparation")
public class AiAnalysisController {

    private final GeminiAiService geminiAiService;

    public AiAnalysisController(GeminiAiService geminiAiService) {
        this.geminiAiService = geminiAiService;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Perform AI job analysis", description = "Sends job description and candidate profile to Gemini AI to generate structured match score, skill matrix, prep roadmap, and tailored interview questions")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> analyzeJob(
            @Valid @RequestBody AiAnalysisRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiAnalysisResponse response = geminiAiService.analyzeJob(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("AI analysis completed successfully", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get AI analysis history", description = "Retrieves previous AI analysis reports for the authenticated user")
    public ResponseEntity<ApiResponse<List<AiAnalysisResponse>>> getAnalysisHistory(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<AiAnalysisResponse> history = geminiAiService.getAnalysisHistory(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @DeleteMapping("/history")
    @Operation(summary = "Clear AI analysis history", description = "Deletes all previous AI analysis reports for the authenticated user")
    public ResponseEntity<ApiResponse<Void>> clearAnalysisHistory(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        geminiAiService.clearAnalysisHistory(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("History cleared successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get AI analysis report by ID", description = "Retrieves a specific AI analysis by its UUID")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> getAnalysisById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiAnalysisResponse response = geminiAiService.getAnalysisById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/application/{applicationId}/latest")
    @Operation(summary = "Get latest analysis for application", description = "Retrieves the most recent AI analysis for a specific job application")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> getLatestAnalysisByApplication(
            @PathVariable UUID applicationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiAnalysisResponse response = geminiAiService.getLatestAnalysisByApplication(applicationId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

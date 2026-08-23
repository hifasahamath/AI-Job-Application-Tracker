package com.jobtracker.controller;

import com.jobtracker.dto.ApiResponse;
import com.jobtracker.dto.company.CompanyRequest;
import com.jobtracker.dto.company.CompanyResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.CompanyService;
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
@RequestMapping("/api/v1/companies")
@Tag(name = "Companies", description = "Endpoints for managing target companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    @Operation(summary = "List all companies", description = "Retrieves all saved companies for the authenticated user")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompanies(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<CompanyResponse> companies = companyService.getAllCompanies(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details", description = "Retrieves details of a specific company by ID")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CompanyResponse company = companyService.getCompanyById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(company));
    }

    @PostMapping
    @Operation(summary = "Create company", description = "Creates a new company record")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CompanyResponse company = companyService.createCompany(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", company));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update company", description = "Updates an existing company's information")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CompanyResponse updated = companyService.updateCompany(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Company updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete company", description = "Removes a company record")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        companyService.deleteCompany(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Company deleted successfully"));
    }
}

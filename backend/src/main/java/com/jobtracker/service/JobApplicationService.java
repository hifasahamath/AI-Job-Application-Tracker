package com.jobtracker.service;

import com.jobtracker.dto.application.JobApplicationRequest;
import com.jobtracker.dto.application.JobApplicationResponse;
import com.jobtracker.dto.application.StatusUpdateRequest;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.*;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyService companyService;
    private final InterviewService interviewService;
    private final NoteService noteService;
    private final GeminiAiService geminiAiService;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 CompanyRepository companyRepository,
                                 UserRepository userRepository,
                                 CompanyService companyService,
                                 InterviewService interviewService,
                                 NoteService noteService,
                                 GeminiAiService geminiAiService) {
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.companyService = companyService;
        this.interviewService = interviewService;
        this.noteService = noteService;
        this.geminiAiService = geminiAiService;
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> getApplications(
            UUID userId,
            ApplicationStatus status,
            Priority priority,
            UUID companyId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return applicationRepository.findWithFilters(userId, status, priority, companyId, search, pageable)
                .map(this::mapToSummaryResponse);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getAllApplicationsList(UUID userId) {
        return applicationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(UUID id, UUID userId) {
        JobApplication application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + id));

        JobApplicationResponse response = mapToSummaryResponse(application);

        // Fetch detailed nested relations
        response.setInterviews(interviewService.getInterviewsByApplication(id, userId));
        response.setNotes(noteService.getNotesByApplicationId(id, userId));
        response.setLatestAiAnalysis(geminiAiService.getLatestAnalysisByApplication(id, userId));

        return response;
    }

    @Transactional
    public JobApplicationResponse createApplication(JobApplicationRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Company company;
        if (request.getCompanyId() != null) {
            company = companyRepository.findByIdAndUserId(request.getCompanyId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));
        } else if (StringUtils.hasText(request.getCompanyName())) {
            company = companyService.getOrCreateCompany(request.getCompanyName(), userId);
        } else {
            company = companyService.getOrCreateCompany("Default Company", userId);
        }

        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setCompany(company);
        application.setJobTitle(request.getJobTitle().trim());
        application.setJobDescription(request.getJobDescription());
        application.setJobUrl(request.getJobUrl());
        application.setStatus(request.getStatus() != null ? request.getStatus() : ApplicationStatus.SAVED);
        application.setSalaryMin(request.getSalaryMin());
        application.setSalaryMax(request.getSalaryMax());
        application.setSalaryCurrency(StringUtils.hasText(request.getSalaryCurrency()) ? request.getSalaryCurrency() : "USD");
        application.setWorkLocationType(request.getWorkLocationType() != null ? request.getWorkLocationType() : WorkLocationType.REMOTE);
        application.setAppliedDate(request.getAppliedDate());
        application.setDeadline(request.getDeadline());
        application.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);

        JobApplication saved = applicationRepository.save(application);
        return mapToSummaryResponse(saved);
    }

    @Transactional
    public JobApplicationResponse updateApplication(UUID id, JobApplicationRequest request, UUID userId) {
        JobApplication application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + id));

        if (request.getCompanyId() != null && !request.getCompanyId().equals(application.getCompany().getId())) {
            Company company = companyRepository.findByIdAndUserId(request.getCompanyId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));
            application.setCompany(company);
        } else if (StringUtils.hasText(request.getCompanyName()) && !request.getCompanyName().equalsIgnoreCase(application.getCompany().getName())) {
            Company company = companyService.getOrCreateCompany(request.getCompanyName(), userId);
            application.setCompany(company);
        }

        application.setJobTitle(request.getJobTitle().trim());
        application.setJobDescription(request.getJobDescription());
        application.setJobUrl(request.getJobUrl());
        if (request.getStatus() != null) {
            application.setStatus(request.getStatus());
        }
        application.setSalaryMin(request.getSalaryMin());
        application.setSalaryMax(request.getSalaryMax());
        if (StringUtils.hasText(request.getSalaryCurrency())) {
            application.setSalaryCurrency(request.getSalaryCurrency());
        }
        if (request.getWorkLocationType() != null) {
            application.setWorkLocationType(request.getWorkLocationType());
        }
        application.setAppliedDate(request.getAppliedDate());
        application.setDeadline(request.getDeadline());
        if (request.getPriority() != null) {
            application.setPriority(request.getPriority());
        }

        JobApplication updated = applicationRepository.save(application);
        return mapToSummaryResponse(updated);
    }

    @Transactional
    public JobApplicationResponse updateStatus(UUID id, StatusUpdateRequest request, UUID userId) {
        JobApplication application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + id));

        application.setStatus(request.getStatus());
        JobApplication updated = applicationRepository.save(application);
        return mapToSummaryResponse(updated);
    }

    @Transactional
    public void deleteApplication(UUID id, UUID userId) {
        JobApplication application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + id));

        applicationRepository.delete(application);
    }

    public JobApplicationResponse mapToSummaryResponse(JobApplication app) {
        if (app == null) return null;
        JobApplicationResponse response = new JobApplicationResponse();
        response.setId(app.getId());
        response.setUserId(app.getUser().getId());
        response.setCompany(companyService.mapToResponse(app.getCompany()));
        response.setJobTitle(app.getJobTitle());
        response.setJobDescription(app.getJobDescription());
        response.setJobUrl(app.getJobUrl());
        response.setStatus(app.getStatus());
        response.setSalaryMin(app.getSalaryMin());
        response.setSalaryMax(app.getSalaryMax());
        response.setSalaryCurrency(app.getSalaryCurrency());
        response.setWorkLocationType(app.getWorkLocationType());
        response.setAppliedDate(app.getAppliedDate());
        response.setDeadline(app.getDeadline());
        response.setPriority(app.getPriority());
        response.setInterviewCount(app.getInterviews() != null ? app.getInterviews().size() : 0);
        response.setNoteCount(app.getNotes() != null ? app.getNotes().size() : 0);

        if (app.getAiAnalyses() != null && !app.getAiAnalyses().isEmpty()) {
            AiAnalysis latest = app.getAiAnalyses().get(app.getAiAnalyses().size() - 1);
            response.setLatestMatchScore(latest.getMatchScore());
        }

        response.setCreatedAt(app.getCreatedAt());
        response.setUpdatedAt(app.getUpdatedAt());
        return response;
    }
}

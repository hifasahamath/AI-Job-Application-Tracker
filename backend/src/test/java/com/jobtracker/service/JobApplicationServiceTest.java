package com.jobtracker.service;

import com.jobtracker.dto.application.JobApplicationRequest;
import com.jobtracker.dto.application.JobApplicationResponse;
import com.jobtracker.dto.application.StatusUpdateRequest;
import com.jobtracker.dto.company.CompanyResponse;
import com.jobtracker.model.*;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyService companyService;

    @Mock
    private InterviewService interviewService;

    @Mock
    private NoteService noteService;

    @Mock
    private GeminiAiService geminiAiService;

    @InjectMocks
    private JobApplicationService applicationService;

    private User user;
    private Company company;
    private JobApplication application;
    private UUID userId;
    private UUID companyId;
    private UUID appId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        companyId = UUID.randomUUID();
        appId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("user@test.com");
        user.setFullName("Test User");

        company = new Company();
        company.setId(companyId);
        company.setName("Acme Tech Corp");
        company.setUser(user);

        application = new JobApplication();
        application.setId(appId);
        application.setUser(user);
        application.setCompany(company);
        application.setJobTitle("Staff Backend Engineer");
        application.setStatus(ApplicationStatus.SAVED);
        application.setPriority(Priority.HIGH);
        application.setSalaryMin(BigDecimal.valueOf(140000));
        application.setSalaryMax(BigDecimal.valueOf(170000));
        application.setWorkLocationType(WorkLocationType.REMOTE);
    }

    @Test
    @DisplayName("Should create job application with existing company")
    void testCreateApplicationWithExistingCompany() {
        JobApplicationRequest request = new JobApplicationRequest();
        request.setCompanyId(companyId);
        request.setJobTitle("Staff Backend Engineer");
        request.setStatus(ApplicationStatus.SAVED);
        request.setSalaryMin(BigDecimal.valueOf(140000));
        request.setSalaryMax(BigDecimal.valueOf(170000));
        request.setWorkLocationType(WorkLocationType.REMOTE);
        request.setPriority(Priority.HIGH);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(companyRepository.findByIdAndUserId(companyId, userId)).thenReturn(Optional.of(company));
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication app = invocation.getArgument(0);
            app.setId(appId);
            return app;
        });
        when(companyService.mapToResponse(company)).thenReturn(new CompanyResponse(companyId, "Acme Tech Corp", null, null, null, null));

        JobApplicationResponse response = applicationService.createApplication(request, userId);

        assertNotNull(response);
        assertEquals("Staff Backend Engineer", response.getJobTitle());
        assertEquals(ApplicationStatus.SAVED, response.getStatus());
        assertEquals(Priority.HIGH, response.getPriority());
        verify(applicationRepository, times(1)).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("Should update application status for Kanban transition")
    void testUpdateStatus() {
        StatusUpdateRequest request = new StatusUpdateRequest(ApplicationStatus.INTERVIEW);

        when(applicationRepository.findByIdAndUserId(appId, userId)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(JobApplication.class))).thenReturn(application);
        when(companyService.mapToResponse(company)).thenReturn(new CompanyResponse(companyId, "Acme Tech Corp", null, null, null, null));

        JobApplicationResponse response = applicationService.updateStatus(appId, request, userId);

        assertNotNull(response);
        assertEquals(ApplicationStatus.INTERVIEW, application.getStatus());
        verify(applicationRepository, times(1)).save(application);
    }

    @Test
    @DisplayName("Should delete job application")
    void testDeleteApplication() {
        when(applicationRepository.findByIdAndUserId(appId, userId)).thenReturn(Optional.of(application));

        applicationService.deleteApplication(appId, userId);

        verify(applicationRepository, times(1)).delete(application);
    }
}

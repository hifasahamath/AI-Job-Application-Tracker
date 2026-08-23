package com.jobtracker.service;

import com.jobtracker.dto.interview.InterviewRequest;
import com.jobtracker.dto.interview.InterviewResponse;
import com.jobtracker.model.*;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private JobApplicationRepository applicationRepository;

    @InjectMocks
    private InterviewService interviewService;

    private User user;
    private Company company;
    private JobApplication application;
    private UUID userId;
    private UUID appId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        appId = UUID.randomUUID();

        user = new User();
        user.setId(userId);

        company = new Company();
        company.setId(UUID.randomUUID());
        company.setName("Stripe");
        company.setUser(user);

        application = new JobApplication();
        application.setId(appId);
        application.setUser(user);
        application.setCompany(company);
        application.setJobTitle("Backend Lead");
        application.setStatus(ApplicationStatus.APPLIED);
    }

    @Test
    @DisplayName("Should schedule interview and auto-transition application to INTERVIEW status")
    void testScheduleInterviewAutoTransition() {
        InterviewRequest request = new InterviewRequest();
        request.setApplicationId(appId);
        request.setRoundType(RoundType.TECHNICAL);
        request.setRoundNumber(1);
        request.setScheduledAt(Instant.now().plusSeconds(86400));
        request.setDurationMinutes(60);
        request.setMeetingLink("https://meet.google.com/abc-defg-hij");
        request.setInterviewerNames("Alex Rivers (Principal Engineer)");

        when(applicationRepository.findByIdAndUserId(appId, userId)).thenReturn(Optional.of(application));
        when(interviewRepository.save(any(Interview.class))).thenAnswer(invocation -> {
            Interview inv = invocation.getArgument(0);
            inv.setId(UUID.randomUUID());
            return inv;
        });

        InterviewResponse response = interviewService.scheduleInterview(request, userId);

        assertNotNull(response);
        assertEquals(RoundType.TECHNICAL, response.getRoundType());
        assertEquals("Backend Lead", response.getJobTitle());
        assertEquals("Stripe", response.getCompanyName());

        // Verify status auto transition
        assertEquals(ApplicationStatus.INTERVIEW, application.getStatus());
        verify(applicationRepository, times(1)).save(application);
        verify(interviewRepository, times(1)).save(any(Interview.class));
    }
}

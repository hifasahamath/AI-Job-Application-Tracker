package com.jobtracker.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.ai.AiAnalysisRequest;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.*;
import com.jobtracker.repository.AiAnalysisRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.service.GeminiAiService;
import com.jobtracker.service.ResumeParserService;
import com.jobtracker.service.SupabaseStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityAuditTest {

    @Mock
    private AiAnalysisRepository aiAnalysisRepository;

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    private GeminiAiService geminiAiService;
    private SupabaseStorageService supabaseStorageService;
    private ResumeParserService resumeParserService;
    private RateLimitingFilter rateLimitingFilter;

    @BeforeEach
    void setUp() {
        geminiAiService = new GeminiAiService(
                aiAnalysisRepository,
                applicationRepository,
                userRepository,
                new RestTemplateBuilder(),
                new ObjectMapper(),
                30000
        );

        supabaseStorageService = new SupabaseStorageService(
                "https://test.supabase.co",
                "test-service-key",
                "profile-pictures"
        );

        resumeParserService = new ResumeParserService();
        rateLimitingFilter = new RateLimitingFilter();
    }

    @Test
    @DisplayName("IDOR Prevention: Should reject accessing AI Analysis for application belonging to another user")
    void testCrossUserDataLeakagePrevention() {
        UUID requestingUserId = UUID.randomUUID();
        UUID victimApplicationId = UUID.randomUUID();

        when(applicationRepository.findByIdAndUserId(victimApplicationId, requestingUserId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            geminiAiService.getLatestAnalysisByApplication(victimApplicationId, requestingUserId);
        });

        verify(aiAnalysisRepository, never()).findTopByApplicationIdOrderByCreatedAtDesc(any());
    }

    @Test
    @DisplayName("Rate Limiter: Should return HTTP 429 when client exceeds request limit")
    void testRateLimitingTriggers429() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("198.51.100.1");

        // Auth endpoint limit is 20 requests per minute
        for (int i = 0; i < 20; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            rateLimitingFilter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }

        // 21st request must trigger 429 TOO MANY REQUESTS
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        MockFilterChain blockedChain = new MockFilterChain();
        rateLimitingFilter.doFilter(request, blockedResponse, blockedChain);

        assertEquals(429, blockedResponse.getStatus());
        assertTrue(blockedResponse.getContentAsString().contains("RATE_LIMIT_EXCEEDED"));
        assertEquals("60", blockedResponse.getHeader("Retry-After"));
    }

    @Test
    @DisplayName("File Upload Security: Rejects SVG, HTML, and executable files")
    void testMaliciousFileUploadRejection() {
        UUID userId = UUID.randomUUID();

        // SVG containing XSS payload
        MockMultipartFile svgFile = new MockMultipartFile(
                "file", "avatar.svg", "image/svg+xml",
                "<svg><script>alert('xss')</script></svg>".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            supabaseStorageService.uploadProfilePicture(userId, svgFile);
        });

        // HTML polyglot
        MockMultipartFile htmlFile = new MockMultipartFile(
                "file", "profile.html", "text/html",
                "<html><body>malicious</body></html>".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            supabaseStorageService.uploadProfilePicture(userId, htmlFile);
        });
    }

    @Test
    @DisplayName("File Upload Security: Rejects files with spoofed MIME type but invalid magic bytes")
    void testMimeSpoofingRejection() {
        UUID userId = UUID.randomUUID();

        // Spoofed content type claiming to be PNG but containing arbitrary text
        MockMultipartFile fakePng = new MockMultipartFile(
                "file", "avatar.png", "image/png",
                "THIS_IS_NOT_A_PNG_FILE_CONTENT".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            supabaseStorageService.uploadProfilePicture(userId, fakePng);
        });
    }

    @Test
    @DisplayName("File Upload Security: Rejects files larger than 5MB")
    void testOversizedImageRejection() {
        UUID userId = UUID.randomUUID();
        byte[] oversizedBytes = new byte[6 * 1024 * 1024]; // 6MB

        MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.png", "image/png", oversizedBytes
        );

        assertThrows(BadRequestException.class, () -> {
            supabaseStorageService.uploadProfilePicture(userId, largeFile);
        });
    }

    @Test
    @DisplayName("Document Parser Security: Rejects non-document files and malicious scripts")
    void testResumeParserRejectsInvalidExtensions() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file", "resume.exe", "application/x-msdownload",
                "MZ90...".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            resumeParserService.extractText(exeFile);
        });

        MockMultipartFile shFile = new MockMultipartFile(
                "file", "script.sh", "application/x-sh",
                "#!/bin/bash\nrm -rf /".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            resumeParserService.extractText(shFile);
        });
    }

    @Test
    @DisplayName("Document Parser Security: Rejects files claiming to be PDF without %PDF header")
    void testResumeParserValidatesPdfHeader() {
        MockMultipartFile fakePdf = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf",
                "INVALID_PDF_BINARY_HEADER".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            resumeParserService.extractText(fakePdf);
        });
    }

    @Test
    @DisplayName("Document Parser Security: Successfully extracts clean text from valid plain text document")
    void testResumeParserExtractsValidPlainText() {
        String sampleResume = "SENIOR SOFTWARE ENGINEER\nExperience with Java, Spring Boot, React, and PostgreSQL.";
        MockMultipartFile textFile = new MockMultipartFile(
                "file", "resume.txt", "text/plain",
                sampleResume.getBytes()
        );

        String result = resumeParserService.extractText(textFile);
        assertNotNull(result);
        assertTrue(result.contains("SENIOR SOFTWARE ENGINEER"));
    }

    @Test
    @DisplayName("AI Analyzer Security: Rejects unowned applicationId during analyzeJob")
    void testAiAnalyzerRejectsUnownedApplicationId() {
        UUID userId = UUID.randomUUID();
        UUID unownedAppId = UUID.randomUUID();

        AiAnalysisRequest request = new AiAnalysisRequest();
        request.setApplicationId(unownedAppId);
        request.setJobDescription("Sample job description requiring Java and Spring");

        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(applicationRepository.findByIdAndUserId(unownedAppId, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            geminiAiService.analyzeJob(request, userId);
        });
    }
}

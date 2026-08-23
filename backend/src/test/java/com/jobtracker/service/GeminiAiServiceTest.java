package com.jobtracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.ai.AiAnalysisResultDto;
import com.jobtracker.repository.AiAnalysisRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GeminiAiServiceTest {

    @Mock
    private AiAnalysisRepository aiAnalysisRepository;

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    private GeminiAiService geminiAiService;

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
    }

    @Test
    @DisplayName("Should generate structured contextual fallback analysis when API key is not present")
    void testContextualFallbackAnalysis() {
        String jobDesc = "We are seeking a Senior Java Engineer with Spring Boot, PostgreSQL, Docker, and REST API experience.";
        String candidateProfile = "5 years experience with Java, Spring Boot, PostgreSQL, React, and Git.";

        AiAnalysisResultDto result = geminiAiService.generateContextualFallbackAnalysis(
                jobDesc, candidateProfile, "Senior Java Engineer", "Tech Innovators"
        );

        assertNotNull(result);
        assertTrue(result.getMatchScore() >= 0 && result.getMatchScore() <= 100);
        assertNotNull(result.getAnalysisSummary());
        assertFalse(result.getMatchingSkills().isEmpty());
        assertFalse(result.getRecommendedPreparationAreas().isEmpty());
        assertFalse(result.getPersonalizedInterviewQuestions().isEmpty());

        // Check skills matching logic
        assertTrue(result.getMatchingSkills().stream().anyMatch(s -> s.contains("Java")));
        assertTrue(result.getMatchingSkills().stream().anyMatch(s -> s.contains("SQL")));
    }
}

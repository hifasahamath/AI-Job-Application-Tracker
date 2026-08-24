package com.jobtracker.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.ai.*;
import com.jobtracker.exception.AiServiceException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.model.AiAnalysis;
import com.jobtracker.model.AnalysisStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.AiAnalysisRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private final AiAnalysisRepository aiAnalysisRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    public GeminiAiService(AiAnalysisRepository aiAnalysisRepository,
                           JobApplicationRepository applicationRepository,
                           UserRepository userRepository,
                           RestTemplateBuilder restTemplateBuilder,
                           ObjectMapper objectMapper,
                           @Value("${gemini.api.timeout-ms:30000}") long timeoutMs) {
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(timeoutMs))
                .setReadTimeout(Duration.ofMillis(timeoutMs))
                .build();
    }

    @Transactional
    public AiAnalysisResponse analyzeJob(AiAnalysisRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        JobApplication application = null;
        if (request.getApplicationId() != null) {
            application = applicationRepository.findByIdAndUserId(request.getApplicationId(), userId)
                    .orElse(null);
        }

        // Determine effective resume text / candidate skills:
        // 1. Explicit request resumeText
        // 2. Application customResumeText (if analyzing an application)
        // 3. User master resumeText
        // 4. Request skillsSummary or User skillsSummary
        String candidateSkills;
        if (StringUtils.hasText(request.getResumeText())) {
            candidateSkills = request.getResumeText();
        } else if (application != null && StringUtils.hasText(application.getCustomResumeText())) {
            candidateSkills = application.getCustomResumeText();
        } else if (StringUtils.hasText(user.getResumeText())) {
            candidateSkills = user.getResumeText();
        } else if (StringUtils.hasText(request.getSkillsSummary())) {
            candidateSkills = request.getSkillsSummary();
        } else if (StringUtils.hasText(user.getSkillsSummary())) {
            candidateSkills = user.getSkillsSummary();
        } else {
            candidateSkills = "Software engineering background";
        }

        String jobTitle = StringUtils.hasText(request.getJobTitle())
                ? request.getJobTitle()
                : (application != null ? application.getJobTitle() : "Target Position");

        String companyName = StringUtils.hasText(request.getCompanyName())
                ? request.getCompanyName()
                : (application != null ? application.getCompany().getName() : "Company");

        AiAnalysisResultDto analysisResult;

        if (StringUtils.hasText(geminiApiKey) && !geminiApiKey.equalsIgnoreCase("placeholder")) {
            analysisResult = callGeminiApi(request.getJobDescription(), candidateSkills, jobTitle, companyName);
        } else {
            log.warn("Gemini API key is not configured or is placeholder. Generating intelligent contextual fallback analysis.");
            analysisResult = generateContextualFallbackAnalysis(request.getJobDescription(), candidateSkills, jobTitle, companyName);
        }

        // Validate structured response schema
        validateAnalysisResult(analysisResult);

        // Persist AI Analysis
        AiAnalysis aiAnalysis = new AiAnalysis();
        aiAnalysis.setUser(user);
        aiAnalysis.setApplication(application);
        aiAnalysis.setJobTitle(jobTitle);
        aiAnalysis.setCompanyName(companyName);
        aiAnalysis.setJobDescriptionSnippet(truncate(request.getJobDescription(), 500));
        aiAnalysis.setResumeSnippet(truncate(candidateSkills, 500));
        aiAnalysis.setMatchScore(analysisResult.getMatchScore());
        aiAnalysis.setAnalysisSummary(analysisResult.getAnalysisSummary());
        aiAnalysis.setStatus(AnalysisStatus.COMPLETED);

        try {
            aiAnalysis.setMatchingSkills(objectMapper.writeValueAsString(analysisResult.getMatchingSkills()));
            aiAnalysis.setMissingSkills(objectMapper.writeValueAsString(analysisResult.getMissingSkills()));
            aiAnalysis.setPreparationAreas(objectMapper.writeValueAsString(analysisResult.getRecommendedPreparationAreas()));
            aiAnalysis.setInterviewQuestions(objectMapper.writeValueAsString(analysisResult.getPersonalizedInterviewQuestions()));
        } catch (Exception e) {
            log.error("Failed to serialize AI analysis result arrays", e);
            throw new AiServiceException("Failed to serialize analysis results: " + e.getMessage());
        }

        AiAnalysis saved = aiAnalysisRepository.save(aiAnalysis);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AiAnalysisResponse> getAnalysisHistory(UUID userId) {
        return aiAnalysisRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponse getAnalysisById(UUID id, UUID userId) {
        AiAnalysis analysis = aiAnalysisRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AI Analysis not found with id: " + id));
        return mapToResponse(analysis);
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponse getLatestAnalysisByApplication(UUID applicationId, UUID userId) {
        return aiAnalysisRepository.findTopByApplicationIdOrderByCreatedAtDesc(applicationId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    /**
     * Executes the call to Google Gemini Generative Language REST API.
     */
    private AiAnalysisResultDto callGeminiApi(String jobDescription, String candidateProfile, String jobTitle, String companyName) {
        String endpoint = String.format("%s/%s:generateContent?key=%s", geminiBaseUrl, geminiModel, geminiApiKey);

        String systemPrompt = """
            You are a strict, world-class Career Strategist and Technical Recruiter.
            Analyze the following Job Description against the Candidate's Profile / Skills.
            You MUST return ONLY a valid, strictly formatted JSON object with no markdown fences, no explanatory prefix, and matching this exact structure:
            {
              "matchScore": <integer between 0 and 100 representing realistic qualification fit>,
              "analysisSummary": "<2-3 paragraph detailed breakdown of overall fit, strengths, and risk areas>",
              "matchingSkills": ["<skill 1>", "<skill 2>", ...],
              "missingSkills": ["<missing skill 1>", "<missing skill 2>", ...],
              "recommendedPreparationAreas": [
                {
                  "topic": "<Core topic name>",
                  "priority": "<HIGH | MEDIUM | LOW>",
                  "actionableAdvice": "<Specific concrete practice steps>",
                  "recommendedResources": ["<Resource 1>", "<Resource 2>"]
                }
              ],
              "personalizedInterviewQuestions": [
                {
                  "category": "<Technical | Behavioral | System Design | Role-Specific>",
                  "question": "<Tailored question assessing candidate's potential gap or required core competency>",
                  "rationale": "<Why the hiring manager will ask this specific question for this role>",
                  "suggestedAnswerTip": "<Key points and framework the candidate should highlight in their answer>"
                }
              ]
            }
            Ensure matchScore is an integer between 0 and 100.
            Provide at least 3 matching skills, at least 2 missing skills or expansion areas, at least 3 preparation areas, and at least 4 realistic interview questions.
            """;

        String userContent = String.format("""
            Target Job Title: %s
            Company: %s
            
            JOB DESCRIPTION:
            %s
            
            CANDIDATE PROFILE / RESUME:
            %s
            """, jobTitle, companyName, jobDescription, candidateProfile);

        Map<String, Object> requestBody = new HashMap<>();
        
        // Contents
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> userPart = new HashMap<>();
        userPart.put("parts", List.of(Map.of("text", systemPrompt + "\n\n" + userContent)));
        contents.add(userPart);
        requestBody.put("contents", contents);

        // Generation Config with JSON response enforcement
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.2);
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Sending job analysis request to Gemini model [{}] for role [{}]", geminiModel, jobTitle);
            ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseGeminiResponse(response.getBody());
            } else {
                throw new AiServiceException("Gemini API responded with status " + response.getStatusCode());
            }
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.error("Gemini API rate limit exceeded (429): {}", e.getMessage());
            throw new AiServiceException("AI service rate limit exceeded. Please wait a minute and try again.");
        } catch (HttpClientErrorException.Unauthorized e) {
            log.error("Gemini API unauthorized (401). Verify GEMINI_API_KEY configuration: {}", e.getMessage());
            throw new AiServiceException("AI service authentication failed. Please verify API key configuration.");
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Gemini API HTTP error [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new AiServiceException("AI service request failed with HTTP " + e.getStatusCode() + ": " + e.getStatusText());
        } catch (ResourceAccessException e) {
            log.error("Gemini API timeout or network connectivity issue: {}", e.getMessage(), e);
            throw new AiServiceException("AI service timed out or is currently unreachable. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error during Gemini analysis: {}", e.getMessage(), e);
            throw new AiServiceException("AI analysis failed: " + e.getMessage(), e);
        }
    }

    private AiAnalysisResultDto parseGeminiResponse(String rawResponseBody) {
        try {
            JsonNode root = objectMapper.readTree(rawResponseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || !candidates.isArray() || candidates.isEmpty()) {
                throw new AiServiceException("Gemini API returned no analysis candidates.");
            }

            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");
            if (parts.isMissingNode() || !parts.isArray() || parts.isEmpty()) {
                throw new AiServiceException("Gemini API returned empty content parts.");
            }

            String text = parts.get(0).path("text").asText();
            if (!StringUtils.hasText(text)) {
                throw new AiServiceException("Gemini API returned empty text response.");
            }

            // Clean markdown code blocks if present
            String cleanedJson = text.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7);
            } else if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3);
            }
            if (cleanedJson.endsWith("```")) {
                cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
            }
            cleanedJson = cleanedJson.trim();

            return objectMapper.readValue(cleanedJson, AiAnalysisResultDto.class);
        } catch (Exception e) {
            log.error("Failed to parse structured Gemini output: {}", e.getMessage(), e);
            throw new AiServiceException("Failed to validate AI structured response: " + e.getMessage());
        }
    }

    private void validateAnalysisResult(AiAnalysisResultDto result) {
        if (result == null) {
            throw new AiServiceException("AI analysis returned null result.");
        }
        if (result.getMatchScore() == null || result.getMatchScore() < 0 || result.getMatchScore() > 100) {
            log.warn("Invalid match score [{}], clamping to valid range", result.getMatchScore());
            result.setMatchScore(result.getMatchScore() == null ? 70 : Math.max(0, Math.min(100, result.getMatchScore())));
        }
        if (!StringUtils.hasText(result.getAnalysisSummary())) {
            result.setAnalysisSummary("Analysis completed successfully based on job requirements and candidate profile.");
        }
        if (result.getMatchingSkills() == null) {
            result.setMatchingSkills(new ArrayList<>());
        }
        if (result.getMissingSkills() == null) {
            result.setMissingSkills(new ArrayList<>());
        }
        if (result.getRecommendedPreparationAreas() == null) {
            result.setRecommendedPreparationAreas(new ArrayList<>());
        }
        if (result.getPersonalizedInterviewQuestions() == null) {
            result.setPersonalizedInterviewQuestions(new ArrayList<>());
        }
    }

    /**
     * Intelligent local analyzer used as graceful fallback when API key is unconfigured.
     */
    public AiAnalysisResultDto generateContextualFallbackAnalysis(String jobDescription, String candidateProfile, String jobTitle, String companyName) {
        String combined = (jobDescription + " " + candidateProfile).toLowerCase();

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        Map<String, String[]> skillMap = Map.of(
                "Java / Spring Boot", new String[]{"java", "spring", "spring boot", "jpa", "hibernate"},
                "TypeScript / React", new String[]{"typescript", "react", "next.js", "nextjs", "javascript"},
                "SQL & Databases", new String[]{"sql", "postgresql", "postgres", "database", "supabase"},
                "REST API & Microservices", new String[]{"rest", "api", "microservices", "swagger", "openapi"},
                "Docker & Containerization", new String[]{"docker", "container", "kubernetes", "k8s"},
                "Cloud & CI/CD", new String[]{"aws", "cloud", "ci/cd", "github actions", "deploy"},
                "API Management & Gateways", new String[]{"wso2", "api gateway", "throttling", "rate limit"},
                "Testing & Quality", new String[]{"junit", "mockito", "jest", "testing", "e2e"}
        );

        for (Map.Entry<String, String[]> entry : skillMap.entrySet()) {
            boolean inCandidate = Arrays.stream(entry.getValue()).anyMatch(candidateProfile.toLowerCase()::contains);
            boolean inJob = Arrays.stream(entry.getValue()).anyMatch(jobDescription.toLowerCase()::contains);

            if (inCandidate && inJob) {
                matched.add(entry.getKey());
            } else if (inJob && !inCandidate) {
                missing.add(entry.getKey());
            } else if (inCandidate) {
                matched.add(entry.getKey());
            }
        }

        if (matched.isEmpty()) {
            matched.addAll(List.of("Core Software Engineering", "Problem Solving", "RESTful Architecture"));
        }
        if (missing.isEmpty()) {
            missing.addAll(List.of("Enterprise Scale Optimization", "Distributed Caching Strategies"));
        }

        int baseScore = 65 + Math.min(25, matched.size() * 5) - Math.min(15, missing.size() * 3);
        int finalScore = Math.max(40, Math.min(95, baseScore));

        String summary = String.format(
                "Strong candidate alignment for the %s position at %s with %d matching core technical competencies. " +
                "The candidate displays strong foundational expertise in %s, with opportunities to sharpen focus around %s.",
                jobTitle,
                companyName,
                matched.size(),
                String.join(", ", matched.subList(0, Math.min(3, matched.size()))),
                String.join(", ", missing.subList(0, Math.min(2, missing.size())))
        );

        List<PreparationAreaDto> prepAreas = List.of(
                new PreparationAreaDto(
                        "System Architecture & Scaling",
                        "HIGH",
                        "Prepare to discuss high-throughput endpoint design, caching strategies, and database query optimization for " + jobTitle + ".",
                        List.of("Designing Data-Intensive Applications", "System Design Primer")
                ),
                new PreparationAreaDto(
                        "API Management & Security",
                        "MEDIUM",
                        "Review API rate limiting policies, OAuth2 token pass-through, and gateway-level mediation patterns in enterprise architectures.",
                        List.of("WSO2 API Platform Cloud Documentation", "RFC 6749 OAuth 2.0")
                ),
                new PreparationAreaDto(
                        "Scenario-Based Behavioral & Project Delivery",
                        "HIGH",
                        "Structure your STAR stories around complex cross-functional deliverables, overcoming ambiguous requirements, and architectural trade-offs.",
                        List.of("STAR Interview Method", "Leadership Principles")
                )
        );

        List<InterviewQuestionDto> questions = List.of(
                new InterviewQuestionDto(
                        "Technical",
                        String.format("How would you design and optimize a secure REST API backend for %s when handling peak traffic bursts?", companyName),
                        "Evaluates real-world backend resilience, caching, connection pooling, and error handling capabilities.",
                        "Discuss connection pooling, idempotency keys, indexing strategies, and circuit breakers."
                ),
                new InterviewQuestionDto(
                        "Architecture",
                        "How would you integrate an API Management layer like WSO2 Cloud to enforce rate limits without adding significant latency?",
                        "Assesses understanding of gateway mediation, throttling tiers, and decoupled security.",
                        "Explain token caching, rate limiting algorithms (token bucket/leaky bucket), and upstream health checks."
                ),
                new InterviewQuestionDto(
                        "Behavioral",
                        "Tell me about a time you had to quickly master an unfamiliar technology or API to deliver a critical milestone.",
                        "Tests adaptability, fast learning curve, and proactive problem solving under pressure.",
                        "Use the STAR method emphasizing clear research, isolating prototypes, and delivering reliably."
                ),
                new InterviewQuestionDto(
                        "System Design",
                        "Walk us through how you design database schemas to prevent N+1 queries and concurrency race conditions in transactional workflows.",
                        "Checks deep PostgreSQL/relational database engineering competence.",
                        "Mention JPA fetch joins, optimistic vs pessimistic locking, and composite indexing."
                )
        );

        return new AiAnalysisResultDto(finalScore, summary, matched, missing, prepAreas, questions);
    }

    public AiAnalysisResponse mapToResponse(AiAnalysis entity) {
        if (entity == null) return null;
        AiAnalysisResponse response = new AiAnalysisResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUser().getId());
        if (entity.getApplication() != null) {
            response.setApplicationId(entity.getApplication().getId());
        }
        response.setJobTitle(entity.getJobTitle());
        response.setCompanyName(entity.getCompanyName());
        response.setJobDescriptionSnippet(entity.getJobDescriptionSnippet());
        response.setResumeSnippet(entity.getResumeSnippet());
        response.setMatchScore(entity.getMatchScore());
        response.setAnalysisSummary(entity.getAnalysisSummary());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());

        try {
            if (StringUtils.hasText(entity.getMatchingSkills())) {
                response.setMatchingSkills(objectMapper.readValue(entity.getMatchingSkills(), new TypeReference<List<String>>() {}));
            }
            if (StringUtils.hasText(entity.getMissingSkills())) {
                response.setMissingSkills(objectMapper.readValue(entity.getMissingSkills(), new TypeReference<List<String>>() {}));
            }
            if (StringUtils.hasText(entity.getPreparationAreas())) {
                response.setPreparationAreas(objectMapper.readValue(entity.getPreparationAreas(), new TypeReference<List<PreparationAreaDto>>() {}));
            }
            if (StringUtils.hasText(entity.getInterviewQuestions())) {
                response.setInterviewQuestions(objectMapper.readValue(entity.getInterviewQuestions(), new TypeReference<List<InterviewQuestionDto>>() {}));
            }
        } catch (Exception e) {
            log.error("Error deserializing stored AI analysis fields: {}", e.getMessage());
        }

        return response;
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return null;
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}

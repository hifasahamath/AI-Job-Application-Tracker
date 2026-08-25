# AI Job Application Tracker — System Architecture & Design

This document details the system design, component responsibilities, database schema, security model, Gemini AI structured integration, and WSO2 API Platform Cloud architecture for the **AI Job Application Tracker**.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["Next.js 14 Web Frontend<br/>(React, TypeScript, Tailwind CSS)"]
    WSO2["WSO2 API Platform Cloud Gateway<br/>(Rate Limiting, Subscriptions, Versioning)"]
    Backend["Spring Boot 3 REST API<br/>(Java 21, Spring Security, JPA/Hibernate, Apache Tika)"]
    Postgres[("Supabase PostgreSQL<br/>Normalized Relational DB")]
    SupabaseStore[("Supabase Storage<br/>Profile Avatars Bucket")]
    Gemini["Google Gemini 1.5/2.5 Flash API<br/>(Structured LLM Job Evaluation)"]

    Client -->|HTTPS + JWT / API Key| WSO2
    WSO2 -->|Managed API Route| Backend
    Backend -->|JDBC / Hibernate| Postgres
    Backend -->|REST S3 API| SupabaseStore
    Backend -->|REST / JSON Schema| Gemini
```

---

## 2. Component Design & Responsibilities

### Frontend Layer (Next.js 14 App Router)
- **State & Routing**: App Router with dynamic client components for real-time reactivity.
- **Kanban Board**: Drag-and-drop / single-click stage transitions with optimistic UI updates.
- **AI Studio**: Interactive form feeding job descriptions and candidate skills into Gemini AI, rendering visual match gauges and preparation roadmaps.
- **Interview Hub**: Chronological schedule cards with countdown timers, status changers, and direct Google Meet / Zoom launchers.
- **Profile & Resume Manager**: Avatar upload with magic-byte validation and automated CV parsing.

### API Gateway Layer (WSO2 API Platform Cloud)
- **API Publishing & Versioning**: Exposes `/job-tracker/v1` mapped to production Spring Boot upstream.
- **Throttling Policies**: Silver tier (60 req/min) for general CRUD, Bronze tier (5 req/min) for AI analysis to protect Gemini quota.
- **Security Pass-through**: Passes JWT Bearer tokens directly downstream while enforcing API subscription keys.
- **Traffic Observability**: Real-time latency tracking, invocation volume metrics, and error rates.

### Backend Layer (Spring Boot 3 + Java 21)
- **Layered Architecture**: Controller → Service → Repository. Thin controllers with `@Valid` DTO validation.
- **Security**: Spring Security with stateless `JwtAuthenticationFilter`, BCrypt hashing, and user-isolated multi-tenant data access.
- **Persistence**: Spring Data JPA with PostgreSQL, indexing on foreign keys and search columns, and custom JPQL metrics queries.
- **Supabase Storage Service**: Multi-layer security validation (magic byte header inspection, MIME whitelist, size clamping) for avatar asset storage.
- **Resume Parser Service**: Apache Tika document analysis extracting text from PDF, DOCX, and TXT resumes.
- **Gemini AI Service**: Resilient client enforcing strict JSON schema, match score validation, retry handling, and fallback capabilities.

---

## 3. Database Schema Design (PostgreSQL / Supabase)

```mermaid
erDiagram
    USERS ||--o{ COMPANIES : owns
    USERS ||--o{ JOB_APPLICATIONS : manages
    USERS ||--o{ AI_ANALYSES : generates
    COMPANIES ||--o{ JOB_APPLICATIONS : receives
    JOB_APPLICATIONS ||--o{ INTERVIEWS : schedules
    JOB_APPLICATIONS ||--o{ APPLICATION_NOTES : contains
    JOB_APPLICATIONS ||--o{ AI_ANALYSES : linked_to

    USERS {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR full_name
        VARCHAR target_role
        TEXT skills_summary
        TEXT resume_text
        VARCHAR profile_picture_url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    COMPANIES {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        VARCHAR website
        VARCHAR industry
        VARCHAR location
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    JOB_APPLICATIONS {
        UUID id PK
        UUID user_id FK
        UUID company_id FK
        VARCHAR job_title
        TEXT job_description
        VARCHAR job_url
        VARCHAR status
        NUMERIC salary_min
        NUMERIC salary_max
        VARCHAR salary_currency
        VARCHAR work_location_type
        DATE applied_date
        DATE deadline
        VARCHAR priority
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    INTERVIEWS {
        UUID id PK
        UUID application_id FK
        VARCHAR round_type
        INT round_number
        TIMESTAMP scheduled_at
        INT duration_minutes
        VARCHAR meeting_link
        VARCHAR interviewer_names
        VARCHAR status
        TEXT notes
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    APPLICATION_NOTES {
        UUID id PK
        UUID application_id FK
        VARCHAR title
        TEXT content
        VARCHAR category
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    AI_ANALYSES {
        UUID id PK
        UUID user_id FK
        UUID application_id FK
        VARCHAR job_title
        VARCHAR company_name
        TEXT job_description_snippet
        TEXT resume_snippet
        INT match_score
        TEXT analysis_summary
        TEXT matching_skills
        TEXT missing_skills
        TEXT preparation_areas
        TEXT interview_questions
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
```

---

## 4. Gemini AI Integration Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Job Seeker
    participant UI as Next.js Frontend
    participant Gateway as WSO2 API Cloud
    participant Backend as Spring Boot Service
    participant Gemini as Google Gemini API
    participant DB as Supabase PostgreSQL

    User->>UI: Submits Job Description & Skills
    UI->>Gateway: POST /api/v1/ai/analyze (Bearer JWT)
    Gateway->>Gateway: Checks Bronze Tier Rate Limit (5 req/min)
    Gateway->>Backend: Forward Request
    Backend->>Backend: Constructs Structured Prompt with JSON Schema Directive
    Backend->>Gemini: POST /models/gemini-1.5-flash:generateContent
    Gemini-->>Backend: Raw JSON Response
    Backend->>Backend: Validate Schema, Clamp Score (0-100), Parse Questions
    Backend->>DB: Persist AiAnalysis Record
    Backend-->>Gateway: HTTP 200 { success: true, data: AiAnalysisResponse }
    Gateway-->>UI: Deliver Response
    UI->>User: Render Score Gauge, Skills Matrix, Prep Roadmap & Questions
```

---

## 5. Security Architecture

1. **Password Protection**: BCrypt with strength factor 10.
2. **Stateless JWTs**: HMAC-SHA256 tokens carrying user identity, expiration timestamp, and subject UUID.
3. **Data Isolation**: Every repository query enforces `user_id = :userId` to guarantee zero cross-tenant leakage.
4. **Error Masking**: Internal server errors, database exceptions, and third-party stack traces are suppressed from the client and translated into sanitized `ErrorResponse` envelopes.

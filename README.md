# CareerPulse AI — Production AI Job Application Tracker

> A production-quality, full-stack AI Job Application Tracker web application built for job seekers to centrally manage applications, schedule interviews, and evaluate job fit with Google Gemini AI, managed through the WSO2 API Platform Cloud Gateway.

---

## 🌟 Key Capabilities & Features

1. **Centralized Application Pipeline (Kanban & Table Views)**
   - Full lifecycle management across 7 stages: `Saved`, `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`, and `Withdrawn`.
   - Single-click and drag-friendly status updates, priority tagging (`Dream Job`, `High`, `Medium`, `Low`), salary tracking, and work mode filters (`Remote`, `Hybrid`, `Onsite`).
   - Advanced multi-criteria search, sorting, and pagination.

2. **Gemini AI-Powered Strategic Job Analyzer**
   - Resilient backend integration with Google Gemini 1.5/2.5 Flash API.
   - Computes a calibrated **Job Match Score** (0–100%).
   - Generates **Matching Skills** vs **Skill Gaps** matrices.
   - Produces a **Recommended Preparation Roadmap** (High/Medium/Low priority topics with concrete study advice).
   - Generates **Personalized Interview Questions** with recruiter rationale and tailored answer frameworks.
   - Strict JSON schema validation before persistence; robust error handling for rate limits (429), timeouts, and offline graceful fallbacks.

3. **Interview Schedule Hub**
   - Scheduled technical, coding, behavioral, system design, and HR rounds.
   - One-click Google Meet / Zoom launcher, interviewer info, and duration.
   - Status toggles (`Scheduled`, `Completed`, `Cancelled`, `Rescheduled`) with automated pipeline stage progression.

4. **WSO2 API Platform Cloud Management**
   - API publishing, versioning (`v1.0.0`), subscription tiers, and rate-limiting policies.
   - Bronze tier (5 req/min) protection on AI endpoints to safeguard Gemini quota; Silver tier (60 req/min) for general CRUD.
   - Decoupled API Gateway architecture with pass-through JWT token security.
   - Traffic monitoring and latency analytics.

5. **Comprehensive Analytics Dashboard**
   - High-level KPI metrics (Total Applications, AI Analyses, Average Match Score).
   - Application status breakdowns and visual funnels.
   - Smart alerts for applications requiring attention (e.g., upcoming deadlines, stalling applications).
   - Quick access to recent applications and upcoming interviews.

---

## 🏗️ Architecture & Technology Stack

```
Next.js 14 Frontend  ──►  WSO2 API Cloud Gateway  ──►  Spring Boot 3 REST API  ──►  Supabase PostgreSQL
                                                                               └──►  Google Gemini API
```

| Layer | Technologies Used |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide Icons, Axios |
| **API Gateway** | WSO2 API Platform Cloud (Cloud / BiJira) |
| **Backend** | Java 21, Spring Boot 3.3.x, Spring Security 6, Spring Data JPA, Hibernate |
| **Security** | Stateless JWT (JJWT 0.12.x), BCrypt password hashing, CORS filters |
| **Database** | PostgreSQL (Supabase / Docker PostgreSQL) with relational DDL & indexes |
| **AI Engine** | Google Gemini 1.5 Flash REST API with JSON schema enforcement |
| **Documentation** | SpringDoc OpenAPI 3.0, Swagger UI, Postman Collection |
| **DevOps & Containers** | Docker, Multi-stage Dockerfiles, Docker Compose |
| **Testing** | JUnit 5, Mockito, MockMvc, H2 in-memory test database |

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)

Make sure Docker is running, then run:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:8080`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`
- **PostgreSQL Database**: `localhost:5432`

---

### Option 2: Run Locally for Development

#### 1. Start Backend (Spring Boot)

```bash
cd backend

# Configure environment variables (or copy .env.example)
export GEMINI_API_KEY="your_api_key_here"

# Build and run backend
mvn spring-boot:run
```

The Spring Boot backend will start on `http://localhost:8080`.

#### 2. Start Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The Next.js frontend will open on `http://localhost:3000`.

---

## 🎯 1-Click Demo Login

For rapid interview presentation, click the **1-Click Demo Mode** button on the login screen or sign in with:
- **Email**: `demo.candidate@jobtracker.dev`
- **Password**: `DemoPass123!`

---

## 🧪 Testing & Quality Verification

### Run Automated Backend Unit & Integration Tests
```bash
cd backend
mvn test
```
- Tests cover `AuthServiceTest`, `JobApplicationServiceTest`, `GeminiAiServiceTest`, `InterviewServiceTest`, and `AuthControllerTest`.

### API Automated Postman Collection
Import [`docs/postman_collection.json`](./docs/postman_collection.json) into Postman to execute automated tests against all endpoints with bearer token injection.

---

## 🌐 WSO2 API Platform Cloud Integration

Refer to the detailed guide in [`docs/WSO2_INTEGRATION_GUIDE.md`](./docs/WSO2_INTEGRATION_GUIDE.md) to import [`docs/openapi.yaml`](./docs/openapi.yaml) into WSO2 Cloud Publisher, configure backend production/sandbox endpoints, set up subscription tiers, and monitor live invocation metrics.

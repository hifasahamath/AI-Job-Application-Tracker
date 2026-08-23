# WSO2 API Platform Cloud Integration Guide

This guide provides step-by-step instructions for publishing, securing, versioning, throttling, and managing the **AI Job Application Tracker REST API** using **WSO2 API Platform Cloud** ([WSO2 Cloud Docs](https://wso2.com/api-platform/docs/)).

---

## 1. Architectural Overview & Boundary Separation

```
┌───────────────────────────────┐
│     Next.js 14 Frontend       │ (TypeScript, React, Tailwind CSS)
└───────────────┬───────────────┘
                │ HTTPS (Requests with JWT / API Key)
                ▼
┌───────────────────────────────┐
│  WSO2 API Platform Cloud      │
│  - API Gateway & Mediation    │
│  - Security & Pass-through    │
│  - Rate Limiting / Throttling │
│  - Lifecycle & Versioning     │
│  - Traffic Analytics & Alerts │
└───────────────┬───────────────┘
                │ Managed REST Calls
                ▼
┌───────────────────────────────┐
│   Spring Boot 3 REST API      │ (Java 21, Spring Security, JPA/Hibernate)
│   - Domain Business Rules     │
│   - Database Persistence      │
│   - Structured Gemini AI Flow │
└───────┬───────────────┬───────┘
        │               │
        ▼               ▼
┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │  Google AI   │
│  (Supabase)  │ │ (Gemini 1.5) │
└──────────────┘ └──────────────┘
```

### Clean Architectural Responsibilities:
- **WSO2 API Platform Cloud**: Acts as the single ingress API Gateway, handling rate limiting/throttling policies, API subscription management, version promotion, access token mediation, and traffic analytics.
- **Spring Boot Backend**: Fully decoupled from gateway specifics; handles JWT authentication, domain validation, persistence, transactions, and structured Gemini AI prompt generation.

---

## 2. Prerequisites
1. A **WSO2 API Platform Cloud** account (Sign up at [wso2.com/api-platform](https://wso2.com/api-platform/)).
2. The OpenAPI 3.0 specification file located in this repository at [`docs/openapi.yaml`](./openapi.yaml).
3. The Spring Boot backend deployed to a publicly reachable endpoint (e.g. AWS EC2, Render, Fly.io, Railway, or an `ngrok` tunnel during live demonstration).

---

## 3. Step-by-Step WSO2 API Cloud Setup

### Step 1: Sign in to WSO2 API Cloud Publisher Portal
1. Navigate to `https://api.cloud.wso2.com/publisher/`.
2. Sign in with your organization credentials.

### Step 2: Create API by Importing OpenAPI 3.0 Specification
1. Click **Create API** → Select **I Have an Existing REST API** → **OpenAPI File/Archive**.
2. Upload the [`docs/openapi.yaml`](./openapi.yaml) file from this repository.
3. Configure API Basics:
   - **Name**: `AI-Job-Tracker-API`
   - **Context**: `/job-tracker`
   - **Version**: `v1.0.0`
4. Click **Create**.

---

### Step 3: Configure Backend Endpoints
1. In the left navigation menu, click **Endpoints**.
2. Configure Endpoint Types:
   - **Production Endpoint**: `https://your-backend-domain.com` (or `https://<tunnel-id>.ngrok-free.app`)
   - **Sandbox Endpoint**: `https://sandbox.your-backend-domain.com`
3. Set **Endpoint Security**:
   - Select **Pass Through** so the client's Bearer JWT is passed intact to the Spring Boot backend.
4. Click **Save**.

---

### Step 4: Configure API Security & Authentication
1. Go to **Runtime Configurations** → **Application Level Security**.
2. Select **OAuth2** and **API Key**.
3. Under **Backend Security**, verify that the `Authorization: Bearer <token>` header is passed downstream to the Spring Boot application.
4. Enable **CORS Configuration**:
   - **Access-Control-Allow-Origin**: `*` (or your Next.js domain `http://localhost:3000`)
   - **Access-Control-Allow-Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
   - **Access-Control-Allow-Headers**: `Authorization, Content-Type, Accept, X-Requested-With`

---

### Step 5: Configure Rate Limiting & Throttling Policies
Rate limiting protects the Gemini API quota and prevents abuse on the database:

1. In the left menu, select **Subscriptions & Throttling**.
2. Enable Business Subscription Tiers:
   - **Unlimited Tier**: For general internal test suites.
   - **Silver Tier (60 req/min)**: Default tier applied to standard CRUD endpoints (`/api/v1/applications`, `/api/v1/interviews`, `/api/v1/notes`).
   - **Bronze Tier (5 req/min)**: Applied specifically to the `/api/v1/ai/analyze` resource to enforce AI quota protection.
3. Under **Resources**, find `POST /api/v1/ai/analyze`:
   - Set **Operation Throttling** to **Bronze Tier (5 req/min)**.
4. Click **Save**.

---

### Step 6: API Lifecycle Management
1. In the left menu, select **Lifecycle**.
2. Lifecycle States Supported:
   - `CREATED` (Initial drafting)
   - `PROTOTYPED` (Mock endpoints)
   - `PUBLISHED` (Live on Developer Portal)
   - `DEPRECATED` (Marked for sunsetting)
   - `RETIRED` (Terminated)
3. Click **Publish** to transition the API from `CREATED` → `PUBLISHED`.

---

### Step 7: Subscribe and Generate Application Keys in Developer Portal
1. Navigate to the **Developer Portal** (`https://api.cloud.wso2.com/devportal/`).
2. Go to **Applications** → Click **Add Application** (`JobTracker-Frontend-App`).
3. Set Token Type to **JWT** and select the **Silver Tier** subscription policy.
4. Go to **APIs** → Select **AI-Job-Tracker-API (v1.0.0)** → Click **Subscribe**.
5. Go to **Production Keys** → Click **Generate Keys** to obtain:
   - Consumer Key
   - Consumer Secret
   - Access Token / API Key

---

### Step 8: Configure Frontend for WSO2 Gateway
To route all Next.js frontend requests through WSO2 API Platform Cloud Gateway, set the environment variable in `frontend/.env.local`:

```bash
# Point frontend to WSO2 API Gateway
NEXT_PUBLIC_API_URL=https://api.cloud.wso2.com/t/jobtracker/v1
```

---

## 4. API Traffic Monitoring & Analytics
WSO2 API Platform Cloud provides real-time analytics for the API:
- **Invocation Volumes**: Track request counts by time window and status codes.
- **Latency Breakdown**: Compare gateway latency vs backend response time (especially useful for monitoring Gemini AI execution duration).
- **Error Breakdown**: Monitor `4xx` client errors, `429` throttle violations, and `5xx` backend exceptions.
- **Top Applications & Users**: Observe usage per registered client application.

To view analytics:
1. Open WSO2 Cloud Publisher or DevPortal.
2. Select **Analytics** in the navigation drawer.
3. Filter by API `AI-Job-Tracker-API` and inspect real-time invocation graphs.

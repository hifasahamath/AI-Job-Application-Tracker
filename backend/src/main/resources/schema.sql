-- AI Job Application Tracker Schema DDL
-- Compatible with PostgreSQL 14+ / Supabase

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    target_role VARCHAR(255),
    skills_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    industry VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    job_url VARCHAR(1000),
    status VARCHAR(50) NOT NULL DEFAULT 'SAVED',
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    work_location_type VARCHAR(50) DEFAULT 'REMOTE',
    applied_date DATE,
    deadline DATE,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_company ON job_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_date ON job_applications(applied_date);

CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    round_type VARCHAR(50) NOT NULL,
    round_number INT DEFAULT 1,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 45,
    meeting_link VARCHAR(1000),
    interviewer_names VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interviews_app ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

CREATE TABLE IF NOT EXISTS application_notes (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_app ON application_notes(application_id);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    job_description_snippet TEXT,
    resume_snippet TEXT,
    match_score INT NOT NULL,
    analysis_summary TEXT NOT NULL,
    matching_skills TEXT,
    missing_skills TEXT,
    preparation_areas TEXT,
    interview_questions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_user ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_app ON ai_analyses(application_id);

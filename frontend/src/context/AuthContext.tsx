'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string, targetRole?: string, skillsSummary?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
  updateProfile: (data: { fullName: string; targetRole?: string; skillsSummary?: string; resumeText?: string }) => Promise<User>;
  refreshProfile: () => Promise<void>;
  loginDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const freshUser = await api.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem('auth_user', JSON.stringify(freshUser));
    } catch (e) {
      // Ignored if network issue
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Also fetch latest profile from backend asynchronously
        api.getCurrentUser().then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        }).catch(() => {});
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const authData = await api.login({ email, password: pass });
    const userData: User = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      targetRole: authData.targetRole,
    };
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);

    // Fetch full profile (including resumeText)
    try {
      const fullUser = await api.getCurrentUser();
      setUser(fullUser);
      localStorage.setItem('auth_user', JSON.stringify(fullUser));
    } catch (e) {}
  };

  const register = async (
    email: string,
    pass: string,
    fullName: string,
    targetRole?: string,
    skillsSummary?: string
  ) => {
    const authData = await api.register({
      email,
      password: pass,
      fullName,
      targetRole,
      skillsSummary,
    });
    const userData: User = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      targetRole: authData.targetRole,
    };
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);
  };

  const updateProfile = async (data: { fullName: string; targetRole?: string; skillsSummary?: string; resumeText?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
    return updated;
  };

  const loginDemo = async () => {
    try {
      await login('demo.candidate@jobtracker.dev', 'DemoPass123!');
    } catch (err) {
      // If demo user doesn't exist yet, automatically register demo user
      await register(
        'demo.candidate@jobtracker.dev',
        'DemoPass123!',
        'Jordan Vance',
        'Senior Full-Stack Engineer',
        'Java 21, Spring Boot, React, TypeScript, PostgreSQL, Docker, Microservices, Gemini AI'
      );
      // Populate demo resume text
      await updateProfile({
        fullName: 'Jordan Vance',
        targetRole: 'Senior Full-Stack Engineer',
        skillsSummary: 'Java 21, Spring Boot, React, TypeScript, PostgreSQL, Docker, Microservices, Gemini AI',
        resumeText: `JORDAN VANCE — SENIOR FULL STACK ENGINEER
Email: jordan.vance@devmail.io | Location: San Francisco, CA (Remote)
Portfolio: github.com/jordan-vance | LinkedIn: linkedin.com/in/jordan-vance

EXECUTIVE SUMMARY
Results-driven Senior Full Stack Engineer with 6+ years of experience designing and scaling high-throughput REST APIs, cloud-native distributed microservices, and interactive modern web applications. Proven track record integrating Google Gemini AI workflows, architecting resilient PostgreSQL databases, and deploying containerized pipelines.

CORE TECHNICAL SKILLS
- Backend: Java 21, Spring Boot 3, Spring Security (OAuth2/JWT), Hibernate/JPA, RESTful API Design, Microservices
- Frontend: TypeScript, JavaScript (ES6+), React 18, Next.js 14 (App Router), Tailwind CSS, HTML5/CSS3
- Data & Cloud: PostgreSQL, Supabase, Redis, Docker, Kubernetes, GitHub Actions CI/CD
- AI & LLM Integration: Google Gemini 1.5 Pro / Flash, OpenAI API, Structured JSON Prompt Engineering

PROFESSIONAL EXPERIENCE
Senior Full Stack Software Engineer | TechScale Solutions (2022 - Present)
- Architected enterprise Spring Boot microservices handling 4M+ daily API requests with sub-100ms p99 latency.
- Built real-time Next.js 14 analytics dashboard with Tailwind CSS and responsive UI components.
- Integrated Google Gemini AI models to automate candidate matching and competency gap detection.
- Led migration from monolithic database to partitioned Supabase PostgreSQL instance.

Full Stack Software Engineer | CloudVenture Labs (2019 - 2022)
- Developed secure authentication services using Spring Security, BCrypt, and JWT bearer tokens.
- Built reusable React component design system with responsive layouts and glassmorphic aesthetics.
- Optimized JPA queries and database indexing, reducing query execution bottlenecks by 42%.

EDUCATION & CERTIFICATIONS
- B.S. in Computer Science — University of California, Berkeley
- AWS Certified Solutions Architect – Associate`
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, updateProfile, refreshProfile, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

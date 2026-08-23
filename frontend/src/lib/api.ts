import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  Company,
  DashboardMetrics,
  Interview,
  ApplicationNote,
  JobApplication,
  PageResponse,
  AiAnalysis,
  ApplicationStatus,
  Priority,
  User
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 35000,
});

// Attach JWT Bearer Token if available
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept Responses & Normalize Errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth
  register: async (data: { email: string; password: string; fullName: string; targetRole?: string; skillsSummary?: string }) => {
    const res = await client.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', data);
    return res.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await client.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', data);
    return res.data.data;
  },

  getCurrentUser: async () => {
    const res = await client.get<ApiResponse<User>>('/api/v1/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: { fullName: string; targetRole?: string; skillsSummary?: string }) => {
    const res = await client.put<ApiResponse<User>>('/api/v1/auth/profile', data);
    return res.data.data;
  },

  // Dashboard
  getDashboardMetrics: async () => {
    const res = await client.get<ApiResponse<DashboardMetrics>>('/api/v1/dashboard/metrics');
    return res.data.data;
  },

  // Applications
  getApplications: async (params?: {
    status?: ApplicationStatus;
    priority?: Priority;
    companyId?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
  }) => {
    const res = await client.get<ApiResponse<PageResponse<JobApplication>>>('/api/v1/applications', { params });
    return res.data.data;
  },

  getAllApplicationsList: async () => {
    const res = await client.get<ApiResponse<JobApplication[]>>('/api/v1/applications/all');
    return res.data.data;
  },

  getApplicationById: async (id: string) => {
    const res = await client.get<ApiResponse<JobApplication>>(`/api/v1/applications/${id}`);
    return res.data.data;
  },

  createApplication: async (data: Partial<JobApplication> & { companyName?: string; companyId?: string }) => {
    const res = await client.post<ApiResponse<JobApplication>>('/api/v1/applications', data);
    return res.data.data;
  },

  updateApplication: async (id: string, data: Partial<JobApplication> & { companyName?: string; companyId?: string }) => {
    const res = await client.put<ApiResponse<JobApplication>>(`/api/v1/applications/${id}`, data);
    return res.data.data;
  },

  updateApplicationStatus: async (id: string, status: ApplicationStatus) => {
    const res = await client.patch<ApiResponse<JobApplication>>(`/api/v1/applications/${id}/status`, { status });
    return res.data.data;
  },

  deleteApplication: async (id: string) => {
    const res = await client.delete<ApiResponse<void>>(`/api/v1/applications/${id}`);
    return res.data.data;
  },

  // Companies
  getCompanies: async () => {
    const res = await client.get<ApiResponse<Company[]>>('/api/v1/companies');
    return res.data.data;
  },

  createCompany: async (data: { name: string; website?: string; industry?: string; location?: string }) => {
    const res = await client.post<ApiResponse<Company>>('/api/v1/companies', data);
    return res.data.data;
  },

  // Interviews
  getUpcomingInterviews: async () => {
    const res = await client.get<ApiResponse<Interview[]>>('/api/v1/interviews/upcoming');
    return res.data.data;
  },

  getInterviewsByApplication: async (applicationId: string) => {
    const res = await client.get<ApiResponse<Interview[]>>(`/api/v1/interviews/application/${applicationId}`);
    return res.data.data;
  },

  scheduleInterview: async (data: Partial<Interview> & { applicationId: string }) => {
    const res = await client.post<ApiResponse<Interview>>('/api/v1/interviews', data);
    return res.data.data;
  },

  updateInterview: async (id: string, data: Partial<Interview>) => {
    const res = await client.put<ApiResponse<Interview>>(`/api/v1/interviews/${id}`, data);
    return res.data.data;
  },

  updateInterviewStatus: async (id: string, status: string) => {
    const res = await client.patch<ApiResponse<Interview>>(`/api/v1/interviews/${id}/status`, { status });
    return res.data.data;
  },

  deleteInterview: async (id: string) => {
    const res = await client.delete<ApiResponse<void>>(`/api/v1/interviews/${id}`);
    return res.data.data;
  },

  // Notes
  getNotesByApplication: async (applicationId: string) => {
    const res = await client.get<ApiResponse<ApplicationNote[]>>(`/api/v1/notes/application/${applicationId}`);
    return res.data.data;
  },

  addNote: async (data: { applicationId: string; title?: string; content: string; category?: string }) => {
    const res = await client.post<ApiResponse<ApplicationNote>>('/api/v1/notes', data);
    return res.data.data;
  },

  deleteNote: async (id: string) => {
    const res = await client.delete<ApiResponse<void>>(`/api/v1/notes/${id}`);
    return res.data.data;
  },

  // AI Analyzer
  analyzeJob: async (data: {
    jobDescription: string;
    jobTitle?: string;
    companyName?: string;
    applicationId?: string;
    resumeText?: string;
    skillsSummary?: string;
  }) => {
    const res = await client.post<ApiResponse<AiAnalysis>>('/api/v1/ai/analyze', data);
    return res.data.data;
  },

  getAiHistory: async () => {
    const res = await client.get<ApiResponse<AiAnalysis[]>>('/api/v1/ai/history');
    return res.data.data;
  },

  getAiAnalysisById: async (id: string) => {
    const res = await client.get<ApiResponse<AiAnalysis>>(`/api/v1/ai/${id}`);
    return res.data.data;
  },

  getLatestAiAnalysisByApplication: async (applicationId: string) => {
    const res = await client.get<ApiResponse<AiAnalysis>>(`/api/v1/ai/application/${applicationId}/latest`);
    return res.data.data;
  }
};

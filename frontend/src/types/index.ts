export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'DREAM_JOB';

export type WorkLocationType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type RoundType =
  | 'SCREENING'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SYSTEM_DESIGN'
  | 'FINAL_ROUND'
  | 'HR'
  | 'OTHER';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type NoteCategory = 'GENERAL' | 'FOLLOW_UP' | 'INTERVIEW_PREP' | 'OFFER_DETAILS';

export type AnalysisStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  targetRole?: string;
  skillsSummary?: string;
  resumeText?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  targetRole?: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  createdAt?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobTitle?: string;
  companyName?: string;
  roundType: RoundType;
  roundNumber: number;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  interviewerNames?: string;
  status: InterviewStatus;
  notes?: string;
  createdAt?: string;
}

export interface ApplicationNote {
  id: string;
  applicationId: string;
  title?: string;
  content: string;
  category: NoteCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreparationArea {
  topic: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionableAdvice: string;
  recommendedResources?: string[];
}

export interface InterviewQuestion {
  category: string;
  question: string;
  rationale: string;
  suggestedAnswerTip: string;
}

export interface AiAnalysis {
  id: string;
  userId: string;
  applicationId?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescriptionSnippet?: string;
  resumeSnippet?: string;
  matchScore: number;
  analysisSummary: string;
  matchingSkills: string[];
  missingSkills: string[];
  preparationAreas: PreparationArea[];
  interviewQuestions: InterviewQuestion[];
  status: AnalysisStatus;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  company: Company;
  jobTitle: string;
  jobDescription?: string;
  customResumeText?: string;
  jobUrl?: string;
  status: ApplicationStatus;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  workLocationType: WorkLocationType;
  appliedDate?: string;
  deadline?: string;
  priority: Priority;
  interviews?: Interview[];
  notes?: ApplicationNote[];
  latestAiAnalysis?: AiAnalysis;
  interviewCount?: number;
  noteCount?: number;
  latestMatchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalApplications: number;
  statusCounts: Record<ApplicationStatus, number>;
  upcomingInterviewsCount: number;
  totalAiAnalysesCount: number;
  averageMatchScore?: number;
  recentApplications: JobApplication[];
  upcomingInterviews: Interview[];
  requiresAttention: JobApplication[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '../../../components/AppShell';
import { StatusBadge } from '../../../components/StatusBadge';
import { PriorityBadge } from '../../../components/PriorityBadge';
import { ScoreGauge } from '../../../components/ScoreGauge';
import { ApplicationModal } from '../../../components/ApplicationModal';
import { InterviewModal } from '../../../components/InterviewModal';
import { NoteModal } from '../../../components/NoteModal';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import {
  JobApplication,
  ApplicationStatus
} from '../../../types';
import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Globe,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Clock,
  Plus,
  Video,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const { success, error } = useToast();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'interviews' | 'notes'>('overview');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      const data = await api.getApplicationById(applicationId);
      setApplication(data);
    } catch (err: any) {
      error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  }, [applicationId, error]);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId, fetchApplicationDetails]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    try {
      const updated = await api.updateApplicationStatus(application.id, newStatus);
      setApplication(updated);
      success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      error('Failed to update status');
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!application) return;
    if (!application.jobDescription) {
      error('Please edit the application to add a Job Description first.');
      return;
    }

    setAnalyzingAi(true);
    try {
      const result = await api.analyzeJob({
        applicationId: application.id,
        jobTitle: application.jobTitle,
        companyName: application.company?.name,
        jobDescription: application.jobDescription,
      });

      setApplication((prev) => (prev ? { ...prev, latestAiAnalysis: result, latestMatchScore: result.matchScore } : null));
      success('Gemini AI Analysis completed successfully!');
      setActiveTab('ai');
    } catch (err: any) {
      error(err.message || 'AI Analysis failed');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!confirm('Are you sure you want to delete this entire job application and all history?')) return;
    try {
      await api.deleteApplication(applicationId);
      success('Application deleted');
      router.push('/applications');
    } catch (err: any) {
      error('Failed to delete application');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(noteId);
      setApplication((prev) =>
        prev ? { ...prev, notes: prev.notes?.filter((n) => n.id !== noteId) } : null
      );
      success('Note deleted');
    } catch (err: any) {
      error('Failed to delete note');
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    try {
      await api.deleteInterview(interviewId);
      setApplication((prev) =>
        prev ? { ...prev, interviews: prev.interviews?.filter((i) => i.id !== interviewId) } : null
      );
      success('Interview deleted');
    } catch (err: any) {
      error('Failed to delete interview');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading opportunity details...</p>
        </div>
      </AppShell>
    );
  }

  if (!application) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <p className="text-sm font-bold text-slate-700">Application not found.</p>
          <Link href="/applications" className="mt-3 inline-block text-xs text-sky-600 font-bold hover:underline">
            ← Return to applications
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link & Quick Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={handleDeleteApplication}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {application.jobTitle}
                </h1>
                <PriorityBadge priority={application.priority} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <span className="font-bold text-sm text-sky-700 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  {application.company?.name}
                </span>
                <span>•</span>
                <span>{application.workLocationType}</span>
                {application.salaryMin || application.salaryMax ? (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {application.salaryMin && application.salaryMax
                        ? `${application.salaryCurrency} ${(application.salaryMin / 1000).toFixed(0)}k - ${(application.salaryMax / 1000).toFixed(0)}k`
                        : `${application.salaryCurrency} ${(application.salaryMin || application.salaryMax! / 1000).toFixed(0)}k`}
                    </span>
                  </>
                ) : null}
                {application.jobUrl && (
                  <>
                    <span>•</span>
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Job Posting Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Status Selector & AI Action */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Pipeline Stage
                </span>
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-2xs"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={analyzingAi}
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50 active:scale-95"
              >
                <Sparkles className={`w-4 h-4 text-sky-200 ${analyzingAi ? 'animate-spin' : ''}`} />
                {analyzingAi ? 'Analyzing with Gemini...' : 'Analyze with AI'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Overview & Description
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ai'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Gemini AI Insights
            {application.latestMatchScore !== undefined && application.latestMatchScore !== null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                {application.latestMatchScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'interviews'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-600" />
            Interviews ({application.interviews?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'notes'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-600" />
            Notes & Prep ({application.notes?.length || 0})
          </button>
        </div>

        {/* Tab 1: Overview & Job Description */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                Job Description
              </h2>
              {application.jobDescription ? (
                <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-sans">
                  {application.jobDescription}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">No job description provided yet.</p>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="mt-2 text-xs font-bold text-sky-600 hover:underline"
                  >
                    + Add job description for Gemini AI analysis
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  Company Details
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Company Name</span>
                    <span className="font-bold text-slate-800">{application.company?.name}</span>
                  </div>
                  {application.company?.industry && (
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Industry</span>
                      <span className="font-semibold text-slate-700">{application.company.industry}</span>
                    </div>
                  )}
                  {application.company?.location && (
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Headquarters / Location</span>
                      <span className="font-semibold text-slate-700">{application.company.location}</span>
                    </div>
                  )}
                  {application.company?.website && (
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Website</span>
                      <a
                        href={application.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:underline font-bold"
                      >
                        {application.company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Timeline Info */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Timeline & Deadlines</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Date Applied:</span>
                    <span className="font-bold text-slate-800">{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Not applied'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Application Deadline:</span>
                    <span className={application.deadline ? 'text-amber-700 font-bold' : 'font-semibold text-slate-700'}>
                      {application.deadline ? new Date(application.deadline).toLocaleDateString() : 'None specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Created:</span>
                    <span className="font-semibold text-slate-700">{new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gemini AI Insights */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {!application.latestAiAnalysis ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">No AI Analysis Generated Yet</h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  Run our Gemini-powered analysis engine on this job posting to generate an instant match score, skill matrix, custom preparation roadmap, and personalized interview questions.
                </p>
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={analyzingAi}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  {analyzingAi ? 'Running Gemini Analysis...' : 'Generate AI Analysis'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score & Summary Banner */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xs">
                  <div className="shrink-0 flex flex-col items-center">
                    <ScoreGauge score={application.latestAiAnalysis.matchScore} size="lg" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        Gemini Strategic Evaluation
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Generated {new Date(application.latestAiAnalysis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Candidate Alignment Summary</h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {application.latestAiAnalysis.analysisSummary}
                    </p>
                  </div>
                </div>

                {/* Skills Match Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching Skills */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
                    <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matching Core Competencies ({application.latestAiAnalysis.matchingSkills?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {application.latestAiAnalysis.matchingSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing / Expansion Skills */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
                    <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Identified Skill Gaps / Focus Areas ({application.latestAiAnalysis.missingSkills?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {application.latestAiAnalysis.missingSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          ⚠ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Preparation Roadmap */}
                {application.latestAiAnalysis.preparationAreas && application.latestAiAnalysis.preparationAreas.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-600" />
                      Recommended Preparation Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {application.latestAiAnalysis.preparationAreas.map((area, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{area.topic}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  area.priority === 'HIGH'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {area.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">{area.actionableAdvice}</p>
                          </div>
                          {area.recommendedResources && area.recommendedResources.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 text-[11px] text-sky-600 font-medium">
                              <span className="font-bold text-slate-500 block text-[10px]">Resources:</span>
                              {area.recommendedResources.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predicted Interview Questions */}
                {application.latestAiAnalysis.interviewQuestions && application.latestAiAnalysis.interviewQuestions.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      Personalized Interview Questions & Answer Guidance
                    </h3>
                    <div className="space-y-4 mt-4">
                      {application.latestAiAnalysis.interviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {q.category} Round Question
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-700 block text-[11px] mb-1">
                                Why Recruiter / Hiring Manager Asks This:
                              </span>
                              <p className="text-slate-600 leading-relaxed font-normal">{q.rationale}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 shadow-2xs">
                              <span className="font-bold text-sky-800 block text-[11px] mb-1">
                                Suggested Answer Framework:
                              </span>
                              <p className="text-sky-900 leading-relaxed font-normal">{q.suggestedAnswerTip}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interviews */}
        {activeTab === 'interviews' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Scheduled Interview Rounds
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track upcoming technical coding, system design, or cultural rounds.
                </p>
              </div>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Schedule Round
              </button>
            </div>

            <div className="space-y-4">
              {!application.interviews || application.interviews.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No interview rounds scheduled yet.</p>
                  <button
                    onClick={() => setIsInterviewModalOpen(true)}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Schedule your first round
                  </button>
                </div>
              ) : (
                application.interviews.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-slate-900">
                          Round {inv.roundNumber}: {inv.roundType}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            inv.status === 'SCHEDULED'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : inv.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-indigo-600 font-bold">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {new Date(inv.scheduledAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}{' '}
                          ({inv.durationMinutes} mins)
                        </span>

                        {inv.interviewerNames && (
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            {inv.interviewerNames}
                          </span>
                        )}
                      </div>

                      {inv.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          {inv.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {inv.meetingLink && (
                        <a
                          href={inv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Meeting
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteInterview(inv.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Interview"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notes & Preparation */}
        {activeTab === 'notes' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Application Notes & Follow-ups
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record recruiter conversations, technical prep notes, and offer negotiation terms.
                </p>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>

            <div className="space-y-4">
              {!application.notes || application.notes.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No notes recorded yet.</p>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="mt-3 text-xs font-bold text-sky-600 hover:underline"
                  >
                    + Add first note
                  </button>
                </div>
              ) : (
                application.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {note.title && <span className="font-bold text-sm text-slate-900">{note.title}</span>}
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 border border-slate-300">
                          {note.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      {note.createdAt && (
                        <span className="text-[10px] text-slate-400 block pt-1 font-medium">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-start"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <ApplicationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => {
            setApplication((prev) => (prev ? { ...prev, ...updated } : updated));
          }}
          applicationToEdit={application}
        />
      )}

      {isInterviewModalOpen && (
        <InterviewModal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          onSuccess={(newInv) => {
            setApplication((prev) =>
              prev ? { ...prev, interviews: [...(prev.interviews || []), newInv], status: 'INTERVIEW' } : null
            );
          }}
          applicationId={application.id}
        />
      )}

      {isNoteModalOpen && (
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSuccess={(newNote) => {
            setApplication((prev) =>
              prev ? { ...prev, notes: [newNote, ...(prev.notes || [])] } : null
            );
          }}
          applicationId={application.id}
        />
      )}
    </AppShell>
  );
}

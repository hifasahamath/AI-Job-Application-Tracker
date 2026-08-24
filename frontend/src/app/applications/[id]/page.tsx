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
import { JobApplication, ApplicationStatus } from '../../../types';
import {
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
  ExternalLink,
  FileText,
  Copy,
  MapPin
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const { success, error } = useToast();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'interviews' | 'notes'>('overview');

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
      error('Add a job description first to run AI analysis.');
      return;
    }

    setAnalyzingAi(true);
    try {
      const result = await api.analyzeJob({
        applicationId: application.id,
        jobTitle: application.jobTitle,
        companyName: application.company?.name,
        jobDescription: application.jobDescription,
        resumeText: application.customResumeText || undefined,
      });

      setApplication((prev) => (prev ? { ...prev, latestAiAnalysis: result, latestMatchScore: result.matchScore } : null));
      success('AI analysis completed');
      setActiveTab('ai');
    } catch (err: any) {
      error(err.message || 'AI analysis failed');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!confirm('Delete this application and all its history?')) return;
    try {
      await api.deleteApplication(applicationId);
      success('Application deleted');
      router.push('/applications');
    } catch (err: any) {
      error('Failed to delete');
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

  const inputClass = "bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading details…</p>
        </div>
      </AppShell>
    );
  }

  if (!application) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-sm font-medium text-gray-700">Application not found.</p>
          <Link href="/applications" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            ← Back to applications
          </Link>
        </div>
      </AppShell>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: 'Overview', count: null },
    { key: 'ai' as const, label: 'AI Analysis', count: application.latestMatchScore !== undefined && application.latestMatchScore !== null ? `${application.latestMatchScore}%` : null },
    { key: 'interviews' as const, label: 'Interviews', count: application.interviews?.length || 0 },
    { key: 'notes' as const, label: 'Notes', count: application.notes?.length || 0 },
  ];

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Back & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={handleDeleteApplication}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold text-gray-900">
                  {application.jobTitle}
                </h1>
                <PriorityBadge priority={application.priority} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                <span className="font-medium text-gray-800 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-gray-400" />
                  {application.company?.name}
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {application.workLocationType}
                </span>
                {(application.salaryMin || application.salaryMax) && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      {application.salaryMin && application.salaryMax
                        ? `${application.salaryCurrency} ${(application.salaryMin / 1000).toFixed(0)}k–${(application.salaryMax / 1000).toFixed(0)}k`
                        : `${application.salaryCurrency} ${((application.salaryMin || application.salaryMax!) / 1000).toFixed(0)}k`}
                    </span>
                  </>
                )}
                {application.jobUrl && (
                  <>
                    <span className="text-gray-300">·</span>
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Posting
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </span>
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                  className={`${inputClass} text-xs`}
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
                className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${analyzingAi ? 'animate-spin' : ''}`} />
                {analyzingAi ? 'Analyzing…' : 'Analyze with AI'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2.5 text-sm font-medium transition-colors border-b-2 shrink-0 ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count !== 0 && (
                <span className="ml-1.5 text-xs text-gray-400 font-normal">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Job Description</h2>
              {application.jobDescription ? (
                <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                  {application.jobDescription}
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">No job description provided.</p>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Add description
                  </button>
                </div>
              )}

              {/* Resume */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Resume
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      application.customResumeText
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {application.customResumeText ? 'Custom' : 'Master CV'}
                    </span>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>

                {application.customResumeText ? (
                  <div className="space-y-2">
                    <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
                      {application.customResumeText}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(application.customResumeText || '');
                        success('Copied to clipboard');
                      }}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy text
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Using Master CV from your profile.</p>
                )}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 h-fit">
              <h3 className="text-sm font-semibold text-gray-900">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd><StatusBadge status={application.status} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Priority</dt>
                  <dd><PriorityBadge priority={application.priority} /></dd>
                </div>
                {application.appliedDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Applied</dt>
                    <dd className="text-gray-700 font-medium">{new Date(application.appliedDate).toLocaleDateString()}</dd>
                  </div>
                )}
                {application.deadline && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Deadline</dt>
                    <dd className="text-amber-700 font-medium">{new Date(application.deadline).toLocaleDateString()}</dd>
                  </div>
                )}
                {application.latestMatchScore !== undefined && application.latestMatchScore !== null && (
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-500">AI Match</dt>
                    <dd><ScoreGauge score={application.latestMatchScore} size="sm" showLabel={false} /></dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Interviews</dt>
                  <dd className="text-gray-700 font-medium">{application.interviews?.length || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="text-gray-700 font-medium">{application.notes?.length || 0}</dd>
                </div>
                {application.createdAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-700">{new Date(application.createdAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* Tab: AI Analysis */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {!application.latestAiAnalysis ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h2 className="text-base font-semibold text-gray-900">No AI analysis yet</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Click "Analyze with AI" to evaluate this job against your resume.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Score & Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-gray-100">
                    <ScoreGauge score={application.latestAiAnalysis.matchScore} size="lg" />
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {application.latestAiAnalysis.jobTitle || application.jobTitle}
                      </h2>
                      <span className="text-sm text-gray-600 block">
                        {application.latestAiAnalysis.companyName || application.company?.name}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed pt-1">
                        {application.latestAiAnalysis.analysisSummary}
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <div className="p-4 rounded-md bg-emerald-50 space-y-2">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Matching Skills ({application.latestAiAnalysis.matchingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {application.latestAiAnalysis.matchingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-emerald-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-amber-50 space-y-2">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Missing Skills ({application.latestAiAnalysis.missingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {application.latestAiAnalysis.missingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-amber-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preparation */}
                {application.latestAiAnalysis.preparationAreas && application.latestAiAnalysis.preparationAreas.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      Preparation Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {application.latestAiAnalysis.preparationAreas.map((area, idx) => (
                        <div key={idx} className="p-3.5 rounded-md bg-gray-50 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{area.topic}</span>
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                              area.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {area.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{area.actionableAdvice}</p>
                          {area.recommendedResources && area.recommendedResources.length > 0 && (
                            <div className="pt-1.5 border-t border-gray-200 text-xs text-gray-500">
                              <span className="font-medium">Resources:</span> {area.recommendedResources.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Questions */}
                {application.latestAiAnalysis.interviewQuestions && application.latestAiAnalysis.interviewQuestions.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      Interview Questions
                    </h3>
                    <div className="space-y-3">
                      {application.latestAiAnalysis.interviewQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-md bg-gray-50 space-y-2">
                          <span className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {q.category}
                          </span>
                          <p className="text-sm font-medium text-gray-900">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-3 rounded-md bg-white border border-gray-200">
                              <span className="font-medium text-gray-700 block mb-1">Why they ask:</span>
                              <p className="text-gray-600 leading-relaxed">{q.rationale}</p>
                            </div>
                            <div className="p-3 rounded-md bg-blue-50 border border-blue-100">
                              <span className="font-medium text-blue-800 block mb-1">Key points:</span>
                              <p className="text-blue-900 leading-relaxed">{q.suggestedAnswerTip}</p>
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

        {/* Tab: Interviews */}
        {activeTab === 'interviews' && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Interview Rounds ({application.interviews?.length || 0})
              </h2>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule
              </button>
            </div>

            {!application.interviews || application.interviews.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">No interviews scheduled</p>
                <p className="text-xs text-gray-400 mt-0.5">Click "Schedule" to add your first round.</p>
              </div>
            ) : (
              application.interviews.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-md bg-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        Round {inv.roundNumber}: {inv.roundType}
                      </span>
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        inv.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        inv.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                        'bg-indigo-50 text-indigo-700'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inv.scheduledAt).toLocaleString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })} ({inv.durationMinutes} min)
                      </span>
                      {inv.interviewerNames && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <UserCheck className="w-3 h-3 text-gray-400" />
                          {inv.interviewerNames}
                        </span>
                      )}
                    </div>
                    {inv.notes && (
                      <p className="text-xs text-gray-600 bg-white p-2.5 rounded-md border border-gray-200 leading-relaxed">
                        {inv.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {inv.meetingLink && (
                      <a
                        href={inv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteInterview(inv.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Notes */}
        {activeTab === 'notes' && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Notes ({application.notes?.length || 0})
              </h2>
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Note
              </button>
            </div>

            {!application.notes || application.notes.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">No notes yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Add notes to track recruiter feedback or prep topics.</p>
              </div>
            ) : (
              application.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-md bg-gray-50 space-y-1.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {note.title && <span className="font-medium text-sm text-gray-900">{note.title}</span>}
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                        {note.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    {note.createdAt && (
                      <span className="text-xs text-gray-400 block pt-0.5">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors self-end sm:self-start"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
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

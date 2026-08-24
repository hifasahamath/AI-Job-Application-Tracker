'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { ScoreGauge } from '../../components/ScoreGauge';
import { ApplicationModal } from '../../components/ApplicationModal';
import { InterviewModal } from '../../components/InterviewModal';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashboardMetrics, JobApplication, ApplicationStatus } from '../../types';
import {
  Briefcase,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Plus,
  Video,
  Building,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { error } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<JobApplication | null>(null);

  const fetchMetrics = async () => {
    try {
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const pipelineStages: { status: ApplicationStatus; label: string; text: string; bg: string }[] = [
    { status: 'SAVED', label: 'Saved', text: 'text-slate-700', bg: 'hover:border-slate-400' },
    { status: 'APPLIED', label: 'Applied', text: 'text-sky-700', bg: 'hover:border-sky-400' },
    { status: 'SCREENING', label: 'Screening', text: 'text-cyan-700', bg: 'hover:border-cyan-400' },
    { status: 'INTERVIEW', label: 'Interview', text: 'text-indigo-700', bg: 'hover:border-indigo-400' },
    { status: 'OFFER', label: 'Offers', text: 'text-emerald-700', bg: 'hover:border-emerald-400' },
    { status: 'REJECTED', label: 'Rejected', text: 'text-rose-700', bg: 'hover:border-rose-400' },
    { status: 'WITHDRAWN', label: 'Withdrawn', text: 'text-zinc-600', bg: 'hover:border-zinc-400' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.fullName || 'Candidate'} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Here is what is happening across your job applications and upcoming interviews.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/ai-analyzer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              Analyze with AI
            </Link>

            <button
              onClick={() => setIsAppModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Pipeline Stage Counts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {pipelineStages.map((stage) => {
            const count = metrics?.statusCounts ? (metrics.statusCounts[stage.status] || 0) : 0;
            return (
              <Link
                key={stage.status}
                href={`/applications?status=${stage.status}`}
                className={`bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md ${stage.bg} transition-all group`}
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {stage.label}
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className={`text-2xl font-black ${stage.text}`}>
                    {loading ? '-' : count}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Action Items & Upcoming Interviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Interviews Widget */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Upcoming Interviews</h2>
                    <p className="text-xs text-slate-500">Scheduled rounds</p>
                  </div>
                </div>
                <Link
                  href="/interviews"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
                >
                  View all
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading schedule...</div>
                ) : !metrics?.upcomingInterviews || metrics.upcomingInterviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-semibold">No upcoming interviews scheduled</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Schedule a round from any application card
                    </p>
                  </div>
                ) : (
                  metrics.upcomingInterviews.slice(0, 3).map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">
                          {inv.jobTitle} • {inv.companyName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-semibold">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>
                            {new Date(inv.scheduledAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {inv.roundType}
                        </span>
                      </div>

                      {inv.meetingLink && (
                        <a
                          href={inv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shrink-0 shadow-2xs"
                          title="Join Meeting"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/interviews"
              className="mt-4 pt-3 border-t border-slate-100 text-center text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
            >
              Open Interview Hub →
            </Link>
          </div>

          {/* Requires Attention / Stale Applications */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Action Items</h2>
                    <p className="text-xs text-slate-500">Deadlines & follow-ups</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Scanning opportunities...</div>
                ) : !metrics?.requiresAttention || metrics.requiresAttention.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-700 font-bold">All caught up!</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No pending deadlines or stale applications requiring attention.
                    </p>
                  </div>
                ) : (
                  metrics.requiresAttention.slice(0, 3).map((app) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 block transition-all group shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                          {app.jobTitle}
                        </span>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                        {app.company?.name}
                      </span>
                      {app.deadline && (
                        <div className="mt-2 text-[10px] text-amber-700 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Deadline: {new Date(app.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/applications/pipeline"
              className="mt-4 pt-3 border-t border-slate-100 text-center text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
            >
              Open Kanban Pipeline →
            </Link>
          </div>

          {/* AI Matching & Analytics Widget */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Gemini AI Insights</h2>
                    <p className="text-xs text-slate-500">Match score & readiness</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center justify-center text-center">
                <ScoreGauge score={metrics?.totalAiAnalysesCount ? 84 : 75} size="lg" />
                <p className="text-xs font-bold text-slate-800 mt-3">
                  {metrics?.totalAiAnalysesCount || 0} Jobs Analyzed with Gemini
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Evaluate job descriptions against your skills, detect gaps, and get personalized interview questions.
                </p>
              </div>
            </div>

            <Link
              href="/ai-analyzer"
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold text-center bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white transition-all shadow-sm shadow-sky-600/20 active:scale-95"
            >
              Launch AI Analyzer Studio
            </Link>
          </div>
        </div>

        {/* Recent Applications List */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                Recent Applications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recently updated opportunities in your pipeline
              </p>
            </div>
            <Link
              href="/applications"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
            >
              View all applications ({metrics?.totalApplications || 0})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading applications...</div>
            ) : !metrics?.recentApplications || metrics.recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-700 font-bold">No applications yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Start tracking by adding your first job application.
                </p>
                <button
                  onClick={() => setIsAppModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add First Application
                </button>
              </div>
            ) : (
              metrics.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                      >
                        {app.jobTitle}
                      </Link>
                      <PriorityBadge priority={app.priority} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {app.company?.name}
                      </span>
                      <span>•</span>
                      <span>{app.workLocationType}</span>
                      {app.appliedDate && (
                        <>
                          <span>•</span>
                          <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={app.status} />
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isAppModalOpen && (
        <ApplicationModal
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          onSuccess={() => {
            fetchMetrics();
          }}
        />
      )}

      {selectedAppForInterview && (
        <InterviewModal
          isOpen={!!selectedAppForInterview}
          onClose={() => setSelectedAppForInterview(null)}
          onSuccess={() => {
            fetchMetrics();
          }}
          applicationId={selectedAppForInterview.id}
        />
      )}
    </AppShell>
  );
}

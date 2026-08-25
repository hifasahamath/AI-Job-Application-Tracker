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
  Calendar,
  Sparkles,
  Clock,
  AlertCircle,
  Plus,
  Video,
  Building,
  CheckCircle2,
  ChevronRight,
  ArrowRight
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

  const pipelineStages: { status: ApplicationStatus; label: string; color: string; borderColor: string }[] = [
    { status: 'SAVED', label: 'Saved', color: 'text-gray-700', borderColor: 'border-l-gray-400' },
    { status: 'APPLIED', label: 'Applied', color: 'text-blue-700', borderColor: 'border-l-blue-500' },
    { status: 'SCREENING', label: 'Screening', color: 'text-cyan-700', borderColor: 'border-l-cyan-500' },
    { status: 'INTERVIEW', label: 'Interview', color: 'text-indigo-700', borderColor: 'border-l-indigo-500' },
    { status: 'OFFER', label: 'Offers', color: 'text-emerald-700', borderColor: 'border-l-emerald-500' },
    { status: 'REJECTED', label: 'Rejected', color: 'text-red-700', borderColor: 'border-l-red-500' },
    { status: 'WITHDRAWN', label: 'Withdrawn', color: 'text-gray-500', borderColor: 'border-l-gray-400' },
  ];

  const SkeletonRow = () => (
    <div className="py-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2.5 flex-1">
        <div className="h-4 bg-gray-100 rounded w-52" />
        <div className="h-3.5 bg-gray-100 rounded w-36" />
      </div>
      <div className="h-7 bg-gray-100 rounded w-20" />
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.fullName || 'there'}
            </h1>
            <p className="text-base text-gray-500 mt-1">
              Your job search at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai-analyzer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Sparkles className="w-4 h-4 text-gray-500" />
              AI Analyzer
            </Link>
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Pipeline Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {pipelineStages.map((stage) => {
            const count = metrics?.statusCounts ? (metrics.statusCounts[stage.status] || 0) : 0;
            return (
              <Link
                key={stage.status}
                href={`/applications?status=${stage.status}`}
                className={`bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-md transition-all group border-l-[3px] ${stage.borderColor}`}
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {stage.label}
                </span>
                <span className={`block text-2xl lg:text-3xl font-bold ${stage.color} mt-1.5`}>
                  {loading ? (
                    <span className="inline-block h-8 w-10 bg-gray-100 rounded animate-pulse" />
                  ) : count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Upcoming Interviews */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-gray-400" />
                Upcoming Interviews
              </h2>
              <Link href="/interviews" className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-0.5 transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-2.5 flex-1">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : !metrics?.upcomingInterviews || metrics.upcomingInterviews.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">No upcoming interviews</p>
                  <p className="text-xs text-gray-400 mt-1">Schedule a round from any application</p>
                </div>
              ) : (
                metrics.upcomingInterviews.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-lg bg-gray-50 flex items-start justify-between gap-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 line-clamp-1">
                        {inv.jobTitle} · {inv.companyName}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(inv.scheduledAt).toLocaleDateString(undefined, {
                            weekday: 'short', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {inv.roundType}
                      </span>
                    </div>
                    {inv.meetingLink && (
                      <a
                        href={inv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition-colors shrink-0 shadow-sm"
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

          {/* Action Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                Action Items
              </h2>
            </div>

            <div className="mt-4 space-y-2.5 flex-1">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : !metrics?.requiresAttention || metrics.requiresAttention.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">All caught up</p>
                  <p className="text-xs text-gray-400 mt-1">No pending deadlines or stale applications</p>
                </div>
              ) : (
                metrics.requiresAttention.slice(0, 3).map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="p-3.5 rounded-lg bg-gray-50 hover:bg-gray-100 block transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{app.jobTitle}</span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 block">{app.company?.name}</span>
                    {app.deadline && (
                      <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(app.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>

            <Link
              href="/applications/pipeline"
              className="mt-4 pt-4 border-t border-gray-100 text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
            >
              View pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AI Score Widget */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-gray-400" />
                AI Match Score
              </h2>
            </div>

            <div className="mt-5 flex flex-col items-center justify-center text-center flex-1">
              <ScoreGauge score={metrics?.averageMatchScore ? Math.round(metrics.averageMatchScore) : 0} size="lg" />
              <p className="text-base font-semibold text-gray-800 mt-4">
                {metrics?.totalAiAnalysesCount || 0} jobs analyzed
              </p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed">
                Evaluate job descriptions against your skills and get interview prep.
              </p>
            </div>

            <Link
              href="/ai-analyzer"
              className="mt-5 w-full py-2.5 rounded-lg text-sm font-medium text-center bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-md active:scale-[0.98] block"
            >
              Open AI Analyzer
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/applications"
              className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View all ({metrics?.totalApplications || 0})
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-2 divide-y divide-gray-100">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : !metrics?.recentApplications || metrics.recentApplications.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Building className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-base text-gray-600 font-medium">No applications yet</p>
                <p className="text-sm text-gray-400 mt-1">Start tracking by adding your first job application.</p>
                <button
                  onClick={() => setIsAppModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-md active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Add Application
                </button>
              </div>
            ) : (
              metrics.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 px-3 -mx-1 rounded-lg transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-semibold text-base text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {app.jobTitle}
                      </Link>
                      <PriorityBadge priority={app.priority} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {app.company?.name}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span>{app.workLocationType}</span>
                      {app.appliedDate && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={app.status} />
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      View
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

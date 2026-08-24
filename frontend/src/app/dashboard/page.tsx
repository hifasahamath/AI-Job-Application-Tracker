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

  const pipelineStages: { status: ApplicationStatus; label: string; color: string }[] = [
    { status: 'SAVED', label: 'Saved', color: 'text-gray-700' },
    { status: 'APPLIED', label: 'Applied', color: 'text-blue-700' },
    { status: 'SCREENING', label: 'Screening', color: 'text-cyan-700' },
    { status: 'INTERVIEW', label: 'Interview', color: 'text-indigo-700' },
    { status: 'OFFER', label: 'Offers', color: 'text-emerald-700' },
    { status: 'REJECTED', label: 'Rejected', color: 'text-red-700' },
    { status: 'WITHDRAWN', label: 'Withdrawn', color: 'text-gray-500' },
  ];

  const SkeletonRow = () => (
    <div className="py-3 flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
      <div className="h-6 bg-gray-100 rounded w-16" />
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.fullName || 'there'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your job search at a glance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai-analyzer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-gray-500" />
              AI Analyzer
            </Link>
            <button
              onClick={() => setIsAppModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Pipeline Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {pipelineStages.map((stage) => {
            const count = metrics?.statusCounts ? (metrics.statusCounts[stage.status] || 0) : 0;
            return (
              <Link
                key={stage.status}
                href={`/applications?status=${stage.status}`}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"
              >
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  {stage.label}
                </span>
                <span className={`block text-xl font-semibold ${stage.color} mt-1`}>
                  {loading ? (
                    <span className="inline-block h-6 w-8 bg-gray-100 rounded animate-pulse" />
                  ) : count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Interviews */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Upcoming Interviews
              </h2>
              <Link href="/interviews" className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-2 flex-1">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : !metrics?.upcomingInterviews || metrics.upcomingInterviews.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">No upcoming interviews</p>
                  <p className="text-xs text-gray-400 mt-0.5">Schedule a round from any application</p>
                </div>
              ) : (
                metrics.upcomingInterviews.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-md bg-gray-50 flex items-start justify-between gap-3"
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
                      <span className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {inv.roundType}
                      </span>
                    </div>
                    {inv.meetingLink && (
                      <a
                        href={inv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors shrink-0"
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
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                Action Items
              </h2>
            </div>

            <div className="mt-3 space-y-2 flex-1">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : !metrics?.requiresAttention || metrics.requiresAttention.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">All caught up</p>
                  <p className="text-xs text-gray-400 mt-0.5">No pending deadlines or stale applications</p>
                </div>
              ) : (
                metrics.requiresAttention.slice(0, 3).map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 block transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{app.jobTitle}</span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 block">{app.company?.name}</span>
                    {app.deadline && (
                      <div className="mt-1.5 text-xs text-amber-700 font-medium flex items-center gap-1">
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
              className="mt-3 pt-3 border-t border-gray-100 text-center text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors block"
            >
              View pipeline
            </Link>
          </div>

          {/* AI Score Widget */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-500" />
                AI Match Score
              </h2>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center text-center flex-1">
              <ScoreGauge score={metrics?.totalAiAnalysesCount ? 84 : 75} size="lg" />
              <p className="text-sm font-medium text-gray-800 mt-3">
                {metrics?.totalAiAnalysesCount || 0} jobs analyzed
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                Evaluate job descriptions against your skills and get interview prep.
              </p>
            </div>

            <Link
              href="/ai-analyzer"
              className="mt-4 w-full py-2 rounded-md text-sm font-medium text-center bg-gray-900 hover:bg-gray-800 text-white transition-colors block"
            >
              Open AI Analyzer
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/applications"
              className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
            >
              View all ({metrics?.totalApplications || 0})
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-3 divide-y divide-gray-100">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : !metrics?.recentApplications || metrics.recentApplications.length === 0 ? (
              <div className="py-10 text-center">
                <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">No applications yet</p>
                <p className="text-xs text-gray-400 mt-1">Start tracking by adding your first job application.</p>
                <button
                  onClick={() => setIsAppModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Application
                </button>
              </div>
            ) : (
              metrics.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 px-2 rounded-md transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {app.jobTitle}
                      </Link>
                      <PriorityBadge priority={app.priority} />
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <Building className="w-3 h-3 text-gray-400" />
                        {app.company?.name}
                      </span>
                      <span>·</span>
                      <span>{app.workLocationType}</span>
                      {app.appliedDate && (
                        <>
                          <span>·</span>
                          <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={app.status} />
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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

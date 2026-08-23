'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { InterviewModal } from '../../components/InterviewModal';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Interview, InterviewStatus } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  UserCheck,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function InterviewsHubPage() {
  const { success, error } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUpcomingInterviews();
      setInterviews(data);
    } catch (err: any) {
      error('Failed to load upcoming interviews');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleStatusUpdate = async (id: string, status: InterviewStatus) => {
    try {
      await api.updateInterviewStatus(id, status);
      success(`Interview marked as ${status.toLowerCase()}`);
      fetchInterviews();
    } catch (err: any) {
      error('Failed to update status');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-400" />
              Interview Schedule Hub
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upcoming technical screenings, coding rounds, and executive calls.
            </p>
          </div>

          <button
            onClick={fetchInterviews}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors self-start sm:self-auto"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Interviews List */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Loading interview rounds...
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-slate-200">No Upcoming Interviews Scheduled</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When you schedule a technical or behavioral round inside any application, it will appear here with meeting launchers and prep details.
              </p>
              <Link
                href="/applications"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Go to Applications
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((inv) => (
                <div
                  key={inv.id}
                  className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-extrabold text-base text-white">
                        {inv.jobTitle}
                      </span>
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {inv.companyName}
                      </span>
                      <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                        Round {inv.roundNumber}: {inv.roundType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        {new Date(inv.scheduledAt).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({inv.durationMinutes} minutes)
                      </span>

                      {inv.interviewerNames && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <UserCheck className="w-4 h-4 text-slate-500" />
                          {inv.interviewerNames}
                        </span>
                      )}
                    </div>

                    {inv.notes && (
                      <p className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        {inv.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
                    {inv.meetingLink && (
                      <a
                        href={inv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        Launch Meeting
                      </a>
                    )}

                    <button
                      onClick={() => handleStatusUpdate(inv.id, 'COMPLETED')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 transition-colors"
                      title="Mark Round Completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Completed
                    </button>

                    <Link
                      href={`/applications/${inv.applicationId}`}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                      title="View Application Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
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
  ExternalLink,
  RefreshCw
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Interviews</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your upcoming technical screenings and calls.
            </p>
          </div>

          <button
            onClick={fetchInterviews}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors self-start sm:self-auto"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Interviews List */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-sm text-gray-500">Loading schedule…</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-800">No upcoming interviews</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                When you schedule a round inside any application, it will appear here.
              </p>
              <Link
                href="/applications"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
              >
                Go to Applications
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-md bg-gray-50 border border-transparent hover:border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">
                        {inv.jobTitle}
                      </span>
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {inv.companyName}
                      </span>
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        Round {inv.roundNumber}: {inv.roundType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(inv.scheduledAt).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({inv.durationMinutes} min)
                      </span>

                      {inv.interviewerNames && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                          {inv.interviewerNames}
                        </span>
                      )}
                    </div>

                    {inv.notes && (
                      <p className="text-xs text-gray-600 bg-white p-2.5 rounded-md border border-gray-200 leading-relaxed mt-1">
                        {inv.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
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
                      onClick={() => handleStatusUpdate(inv.id, 'COMPLETED')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                      title="Mark Completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </button>

                    <Link
                      href={`/applications/${inv.applicationId}`}
                      className="p-1.5 rounded-md bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
                      title="View Details"
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

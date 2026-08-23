'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { KanbanColumn } from '../../../components/KanbanColumn';
import { ApplicationModal } from '../../../components/ApplicationModal';
import { InterviewModal } from '../../../components/InterviewModal';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { JobApplication, ApplicationStatus } from '../../../types';
import { Kanban, Plus, RefreshCw } from 'lucide-react';

const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  colorClass: string;
  dotClass: string;
}[] = [
  { status: 'SAVED', label: 'Saved', colorClass: 'bg-slate-800 text-slate-300', dotClass: 'bg-slate-400' },
  { status: 'APPLIED', label: 'Applied', colorClass: 'bg-sky-950 text-sky-300 border border-sky-800/60', dotClass: 'bg-sky-400' },
  { status: 'SCREENING', label: 'Screening', colorClass: 'bg-cyan-950 text-cyan-300 border border-cyan-800/60', dotClass: 'bg-cyan-400' },
  { status: 'INTERVIEW', label: 'Interview', colorClass: 'bg-indigo-950 text-indigo-300 border border-indigo-700/60', dotClass: 'bg-indigo-400 animate-pulse' },
  { status: 'OFFER', label: 'Offer', colorClass: 'bg-emerald-950 text-emerald-300 border border-emerald-700/60', dotClass: 'bg-emerald-400' },
  { status: 'REJECTED', label: 'Rejected', colorClass: 'bg-rose-950 text-rose-300 border border-rose-800/60', dotClass: 'bg-rose-400' },
  { status: 'WITHDRAWN', label: 'Withdrawn', colorClass: 'bg-zinc-800 text-zinc-400 border border-zinc-700/60', dotClass: 'bg-zinc-500' },
];

export default function PipelinePage() {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStatusForModal, setInitialStatusForModal] = useState<ApplicationStatus>('SAVED');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getAllApplicationsList();
      setApplications(data);
    } catch (err: any) {
      error('Failed to load applications pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await api.updateApplicationStatus(appId, newStatus);
      success(`Moved to ${newStatus}`);
    } catch (err: any) {
      error('Failed to update stage');
      fetchApplications();
    }
  };

  const handleAddInColumn = (colStatus: ApplicationStatus) => {
    setInitialStatusForModal(colStatus);
    setIsModalOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Kanban className="w-6 h-6 text-sky-400" />
              Application Pipeline
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Visual Kanban workflow across all job opportunity lifecycle stages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchApplications}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleAddInColumn('SAVED')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Horizontal scrollable Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-14rem)]">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((app) => app.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                count={colApps.length}
                colorClass={col.colorClass}
                dotClass={col.dotClass}
                applications={colApps}
                onAddInColumn={handleAddInColumn}
                onStatusChange={handleStatusChange}
              />
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newApp) => {
            setApplications((prev) => [newApp, ...prev]);
          }}
        />
      )}
    </AppShell>
  );
}

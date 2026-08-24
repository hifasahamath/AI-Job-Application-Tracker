'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { KanbanColumn } from '../../../components/KanbanColumn';
import { ApplicationModal } from '../../../components/ApplicationModal';
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
  { status: 'SAVED', label: 'Saved', colorClass: 'bg-slate-200/80 text-slate-700 border-slate-300', dotClass: 'bg-slate-500' },
  { status: 'APPLIED', label: 'Applied', colorClass: 'bg-sky-100 text-sky-700 border-sky-200', dotClass: 'bg-sky-500' },
  { status: 'SCREENING', label: 'Screening', colorClass: 'bg-cyan-100 text-cyan-700 border-cyan-200', dotClass: 'bg-cyan-500' },
  { status: 'INTERVIEW', label: 'Interview', colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200', dotClass: 'bg-indigo-500 animate-pulse' },
  { status: 'OFFER', label: 'Offer', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500' },
  { status: 'REJECTED', label: 'Rejected', colorClass: 'bg-rose-100 text-rose-700 border-rose-200', dotClass: 'bg-rose-500' },
  { status: 'WITHDRAWN', label: 'Withdrawn', colorClass: 'bg-zinc-200 text-zinc-600 border-zinc-300', dotClass: 'bg-zinc-400' },
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
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Kanban className="w-5 h-5" />
              </div>
              Application Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Visual Kanban workflow across all job opportunity lifecycle stages.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchApplications}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-2xs"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleAddInColumn('SAVED')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all active:scale-95"
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

'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { KanbanColumn } from '../../../components/KanbanColumn';
import { ApplicationModal } from '../../../components/ApplicationModal';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { JobApplication, ApplicationStatus } from '../../../types';
import { Plus, RefreshCw } from 'lucide-react';

const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  colorClass: string;
  dotClass: string;
}[] = [
  { status: 'SAVED', label: 'Saved', colorClass: 'bg-gray-100 text-gray-700', dotClass: 'bg-gray-500' },
  { status: 'APPLIED', label: 'Applied', colorClass: 'bg-blue-50 text-blue-700', dotClass: 'bg-blue-500' },
  { status: 'SCREENING', label: 'Screening', colorClass: 'bg-cyan-50 text-cyan-700', dotClass: 'bg-cyan-500' },
  { status: 'INTERVIEW', label: 'Interview', colorClass: 'bg-indigo-50 text-indigo-700', dotClass: 'bg-indigo-500' },
  { status: 'OFFER', label: 'Offer', colorClass: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  { status: 'REJECTED', label: 'Rejected', colorClass: 'bg-red-50 text-red-700', dotClass: 'bg-red-500' },
  { status: 'WITHDRAWN', label: 'Withdrawn', colorClass: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400' },
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
      error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
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
      <div className="flex flex-col h-full -m-3 sm:-m-5 md:-m-6 lg:-mx-10 lg:-my-8">
        {/* Pipeline header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-5 md:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Drag-free Kanban view of your application stages.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchApplications}
              className="p-2.5 rounded-lg text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleAddInColumn('SAVED')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Pipeline board — independent horizontal scroll, columns scroll vertically */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pipeline-board px-3 sm:px-5 md:px-6 lg:px-10 pb-4 sm:pb-6">
          <div className="flex gap-4 items-start h-full min-w-min">
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

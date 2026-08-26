'use client';

import React from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { ApplicationCard } from './ApplicationCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: ApplicationStatus;
  label: string;
  count: number;
  colorClass: string;
  dotClass: string;
  applications: JobApplication[];
  onAddInColumn: (status: ApplicationStatus) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  label,
  count,
  colorClass,
  dotClass,
  applications,
  onAddInColumn,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col min-w-[260px] sm:min-w-[300px] w-[280px] sm:w-[320px] shrink-0 rounded-xl bg-gray-50/80 border border-gray-200 shadow-sm h-full">
      {/* Column header — sticky within the column */}
      <div className="flex items-center justify-between p-3.5 px-4 border-b border-gray-200/60">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
          <h3 className="font-semibold text-base text-gray-800">{label}</h3>
          <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">
            {count}
          </span>
        </div>
        <button
          onClick={() => onAddInColumn(status)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          title={`Add ${label} application`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Card list — independently scrollable */}
      <div className="flex-1 overflow-y-auto kanban-column-scroll p-3 space-y-2.5">
        {applications.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl bg-white/60 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-gray-400">No applications</p>
            <button
              onClick={() => onAddInColumn(status)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              + Add first
            </button>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

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
    <div className="flex flex-col flex-1 min-w-[260px] max-w-[320px] rounded-lg bg-gray-50 border border-gray-200 p-3 h-full">
      <div className="flex items-center justify-between pb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <h3 className="font-medium text-sm text-gray-800">{label}</h3>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
            {count}
          </span>
        </div>
        <button
          onClick={() => onAddInColumn(status)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          title={`Add ${label} application`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
        {applications.length === 0 ? (
          <div className="h-28 border border-dashed border-gray-200 rounded-md bg-white flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-gray-400">No applications</p>
            <button
              onClick={() => onAddInColumn(status)}
              className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
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

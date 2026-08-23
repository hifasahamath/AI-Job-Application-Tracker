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
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[340px] rounded-2xl bg-slate-950/40 border border-slate-800/80 p-3 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <h3 className="font-bold text-sm text-slate-200">{label}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
            {count}
          </span>
        </div>
        <button
          onClick={() => onAddInColumn(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Add ${label} application`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Applications list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {applications.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">No applications</p>
            <button
              onClick={() => onAddInColumn(status)}
              className="mt-1.5 text-xs text-sky-400 hover:underline font-semibold"
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

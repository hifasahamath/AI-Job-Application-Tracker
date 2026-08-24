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
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[340px] rounded-2xl bg-slate-100/70 border border-slate-200/90 p-3.5 h-full shadow-2xs">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
          <h3 className="font-bold text-sm text-slate-800">{label}</h3>
          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${colorClass}`}>
            {count}
          </span>
        </div>
        <button
          onClick={() => onAddInColumn(status)}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
          title={`Add ${label} application`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Applications list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {applications.length === 0 ? (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-slate-400 font-medium">No applications</p>
            <button
              onClick={() => onAddInColumn(status)}
              className="mt-1 text-xs text-sky-600 hover:text-sky-700 font-bold hover:underline"
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

'use client';

import React from 'react';
import Link from 'next/link';
import { JobApplication, ApplicationStatus } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { ScoreGauge } from './ScoreGauge';
import {
  Building,
  Calendar,
  DollarSign,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Clock,
  Briefcase
} from 'lucide-react';

interface ApplicationCardProps {
  application: JobApplication;
  onStatusChange?: (id: string, newStatus: ApplicationStatus) => void;
  onScheduleInterview?: (app: JobApplication) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onStatusChange,
  onScheduleInterview,
}) => {
  const formatSalary = (min?: number, max?: number, curr: string = 'USD') => {
    if (!min && !max) return null;
    const format = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n);
    if (min && max) return `${curr} ${format(min)} - ${format(max)}`;
    if (min) return `${curr} ${format(min)}+`;
    return `Up to ${curr} ${format(max!)}`;
  };

  const salaryStr = formatSalary(application.salaryMin, application.salaryMax, application.salaryCurrency);

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between group">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-400 flex items-center gap-1.5 truncate">
            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{application.company?.name || 'Company'}</span>
          </span>
          <PriorityBadge priority={application.priority} />
        </div>

        {/* Title */}
        <Link
          href={`/applications/${application.id}`}
          className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1"
        >
          {application.jobTitle}
        </Link>

        {/* Location & Salary */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-slate-500" />
            {application.workLocationType}
          </span>
          {salaryStr && (
            <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
              <DollarSign className="w-3 h-3" />
              {salaryStr}
            </span>
          )}
        </div>

        {/* AI Score Badge if available */}
        {application.latestMatchScore !== undefined && application.latestMatchScore !== null && (
          <div className="mt-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Gemini Match</span>
            </div>
            <ScoreGauge score={application.latestMatchScore} size="sm" showLabel={false} />
          </div>
        )}
      </div>

      {/* Footer Info & Stage Movers */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {application.interviewCount ? (
            <span className="flex items-center gap-1 text-indigo-300 font-medium" title="Scheduled Interviews">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {application.interviewCount}
            </span>
          ) : null}
          {application.noteCount ? (
            <span className="flex items-center gap-1 text-slate-400" title="Notes">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              {application.noteCount}
            </span>
          ) : null}
          {application.appliedDate && (
            <span className="text-[11px] text-slate-500">
              {new Date(application.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <Link
          href={`/applications/${application.id}`}
          className="text-slate-400 hover:text-sky-400 p-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-0.5 text-xs font-semibold"
        >
          Details
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { JobApplication, ApplicationStatus } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { ScoreGauge } from './ScoreGauge';
import {
  Building,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Clock,
  MapPin
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
    if (min && max) return `${curr} ${format(min)}–${format(max)}`;
    if (min) return `${curr} ${format(min)}+`;
    return `Up to ${curr} ${format(max!)}`;
  };

  const salaryStr = formatSalary(application.salaryMin, application.salaryMax, application.salaryCurrency);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:border-gray-300 hover:shadow-md transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 truncate">
            <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{application.company?.name || 'Company'}</span>
          </span>
          <PriorityBadge priority={application.priority} />
        </div>

        <Link
          href={`/applications/${application.id}`}
          className="font-semibold text-[15px] text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1"
        >
          {application.jobTitle}
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            {application.workLocationType}
          </span>
          {salaryStr && (
            <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
              <DollarSign className="w-3 h-3" />
              {salaryStr}
            </span>
          )}
        </div>

        {application.latestMatchScore !== undefined && application.latestMatchScore !== null && (
          <div className="mt-3 p-2.5 rounded-lg bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-600 font-medium">AI Match</span>
            <ScoreGauge score={application.latestMatchScore} size="sm" showLabel={false} />
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {application.interviewCount ? (
            <span className="flex items-center gap-1 text-indigo-600 font-medium" title="Interviews">
              <Clock className="w-3.5 h-3.5" />
              {application.interviewCount}
            </span>
          ) : null}
          {application.noteCount ? (
            <span className="flex items-center gap-1" title="Notes">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              {application.noteCount}
            </span>
          ) : null}
          {application.appliedDate && (
            <span className="text-xs text-gray-400">
              {new Date(application.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <Link
          href={`/applications/${application.id}`}
          className="text-gray-500 hover:text-gray-900 flex items-center gap-0.5 text-xs font-semibold transition-colors"
        >
          Details
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

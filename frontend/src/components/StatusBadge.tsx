import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  SAVED: {
    label: 'Saved',
    bg: 'bg-slate-100',
    text: 'text-slate-700 font-semibold',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
  },
  APPLIED: {
    label: 'Applied',
    bg: 'bg-sky-50',
    text: 'text-sky-700 font-semibold',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  SCREENING: {
    label: 'Screening',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700 font-semibold',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
  },
  INTERVIEW: {
    label: 'Interview',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700 font-semibold',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500 animate-pulse',
  },
  OFFER: {
    label: 'Offer',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700 font-semibold',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700 font-semibold',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: 'bg-zinc-100',
    text: 'text-zinc-600 font-medium',
    border: 'border-zinc-200',
    dot: 'bg-zinc-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.SAVED;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

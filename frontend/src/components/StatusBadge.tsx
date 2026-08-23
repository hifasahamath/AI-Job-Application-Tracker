import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ApplicationStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  SAVED: {
    label: 'Saved',
    bg: 'bg-slate-800/80',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  },
  APPLIED: {
    label: 'Applied',
    bg: 'bg-sky-950/60',
    text: 'text-sky-300',
    border: 'border-sky-800/60',
    dot: 'bg-sky-400',
  },
  SCREENING: {
    label: 'Screening',
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-300',
    border: 'border-cyan-800/60',
    dot: 'bg-cyan-400',
  },
  INTERVIEW: {
    label: 'Interview',
    bg: 'bg-indigo-950/70',
    text: 'text-indigo-300',
    border: 'border-indigo-700/60',
    dot: 'bg-indigo-400 animate-pulse',
  },
  OFFER: {
    label: 'Offer',
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    dot: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-800/60',
    dot: 'bg-rose-400',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: 'bg-zinc-800/60',
    text: 'text-zinc-400',
    border: 'border-zinc-700/60',
    dot: 'bg-zinc-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.SAVED;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-medium' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

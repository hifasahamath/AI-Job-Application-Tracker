import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ApplicationStatus, { label: string; classes: string }> = {
  SAVED: { label: 'Saved', classes: 'bg-gray-100 text-gray-700' },
  APPLIED: { label: 'Applied', classes: 'bg-blue-50 text-blue-700' },
  SCREENING: { label: 'Screening', classes: 'bg-cyan-50 text-cyan-700' },
  INTERVIEW: { label: 'Interview', classes: 'bg-indigo-50 text-indigo-700' },
  OFFER: { label: 'Offer', classes: 'bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Rejected', classes: 'bg-red-50 text-red-700' },
  WITHDRAWN: { label: 'Withdrawn', classes: 'bg-gray-100 text-gray-500' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.SAVED;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-block rounded-md font-medium ${config.classes} ${sizeClasses}`}>
      {config.label}
    </span>
  );
};

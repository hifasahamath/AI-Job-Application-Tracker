import React from 'react';
import { Priority } from '../types';
import { Star, ArrowUp, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'DREAM_JOB':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
          <Star className="w-3 h-3" />
          Dream
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700">
          <ArrowUp className="w-3 h-3" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-500">
          <Minus className="w-3 h-3" />
          Low
        </span>
      );
  }
};

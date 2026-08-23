import React from 'react';
import { Priority } from '../types';
import { Sparkles, Flame, Check, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'DREAM_JOB':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Dream Job
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60">
          <Flame className="w-3 h-3 text-rose-400" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700/60">
          <Check className="w-3 h-3 text-slate-400" />
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/40 text-zinc-400 border border-zinc-700/40">
          <Minus className="w-3 h-3 text-zinc-500" />
          Low
        </span>
      );
  }
};

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Plus, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onNewApplication?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewApplication }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              CareerPulse <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline-block">Job Application Tracker</span>
          </div>
        </Link>

        {/* WSO2 Managed API indicator */}
        <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>WSO2 API Platform Cloud Gateway Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/ai-analyzer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600/30 to-sky-600/30 hover:from-indigo-600/50 hover:to-sky-600/50 text-sky-300 border border-sky-500/30 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          AI Job Analyzer
        </Link>

        {onNewApplication && (
          <button
            onClick={onNewApplication}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span> Application
          </button>
        )}

        {/* User profile dropdown info */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex flex-col text-right hidden md:block">
              <span className="text-xs font-semibold text-slate-200">{user.fullName}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.targetRole || user.email}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sky-400 border border-slate-700 font-bold text-xs">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

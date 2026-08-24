'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Plus, LogOut, User as UserIcon, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNewApplication?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewApplication,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Career AI Logo" className="h-9 w-9 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              Career <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-2xs">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline-block font-medium">Job Application Tracker</span>
          </div>
        </Link>

        {/* WSO2 Managed API indicator */}
        <div className="hidden lg:flex items-center gap-1.5 ml-4 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>WSO2 API Cloud Gateway</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          href="/ai-analyzer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          AI Job Analyzer
        </Link>

        {onNewApplication && (
          <button
            onClick={onNewApplication}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span> Application
          </button>
        )}

        {/* User profile info & sign out */}
        {user && (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="flex flex-col text-right hidden md:block">
              <span className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</span>
              <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{user.targetRole || user.email}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs shadow-2xs">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

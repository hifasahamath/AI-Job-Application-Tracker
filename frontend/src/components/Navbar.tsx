'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Plus, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Career AI" className="h-7 w-7 object-contain" />
          <span className="font-semibold text-sm text-gray-900">Career AI</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {onNewApplication && (
          <button
            onClick={onNewApplication}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span> Application
          </button>
        )}

        {user && (
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-200">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-gray-900 leading-tight">{user.fullName}</span>
              <span className="text-[11px] text-gray-500 truncate max-w-[140px]">{user.targetRole || user.email}</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

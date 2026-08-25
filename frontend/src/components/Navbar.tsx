'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Plus, User as UserIcon, Menu, X } from 'lucide-react';

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
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white px-5 sm:px-6 shadow-[var(--navbar-shadow)]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Career AI" className="h-8 w-8 object-contain" />
          <span className="font-bold text-base text-gray-900 tracking-tight">Career AI</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {onNewApplication && (
          <button
            onClick={onNewApplication}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span> Application
          </button>
        )}

        {user && (
          <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900 leading-tight">{user.fullName}</span>
              <span className="text-xs text-gray-500 truncate max-w-[160px]">{user.targetRole || user.email}</span>
            </div>
            <Link href="/profile" className="block">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.fullName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm hover:ring-gray-200 transition-all"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold ring-2 ring-white shadow-sm hover:ring-gray-200 transition-all">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

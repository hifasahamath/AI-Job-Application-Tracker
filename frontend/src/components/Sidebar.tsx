'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Kanban,
  List,
  Sparkles,
  Calendar,
  FileText,
  LogOut,
  User as UserIcon,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pipeline', href: '/applications/pipeline', icon: Kanban },
    { name: 'Applications', href: '/applications', icon: List },
    { name: 'AI Analyzer', href: '/ai-analyzer', icon: Sparkles },
    { name: 'Interviews', href: '/interviews', icon: Calendar },
    { name: 'Profile & Resume', href: '/profile', icon: FileText },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between py-5 px-3">
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : item.href === '/applications'
              ? pathname === '/applications'
              : pathname === item.href || pathname.startsWith(item.href + '/');

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gray-900" />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User info + Sign Out at bottom */}
      {user && (
        <div className="border-t border-gray-200/80 pt-4 mt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-semibold shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-gray-200/80 bg-[#f4f5f7] overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-900/20 transition-opacity animate-fade-in"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-[min(18rem,85vw)] bg-[#f4f5f7] border-r border-gray-200 z-50 animate-slide-in-left flex flex-col pt-2 safe-area-bottom">
            <div className="flex items-center justify-end px-3 py-2">
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

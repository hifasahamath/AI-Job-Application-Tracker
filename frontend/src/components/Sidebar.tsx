'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  List,
  Sparkles,
  Calendar,
  FileText,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pipeline', href: '/applications/pipeline', icon: Kanban },
    { name: 'Applications', href: '/applications', icon: List },
    { name: 'AI Analyzer', href: '/ai-analyzer', icon: Sparkles },
    { name: 'Interviews', href: '/interviews', icon: Calendar },
    { name: 'Profile & Resume', href: '/profile', icon: FileText },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between py-4 px-3">
      <div className="space-y-0.5">
        <div className="flex items-center justify-between px-2 pb-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Navigation
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-56 shrink-0 hidden md:flex flex-col border-r border-gray-200 bg-white min-h-[calc(100vh-3.5rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-900/20 transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 animate-fade-in flex flex-col pt-2">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

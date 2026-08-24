'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Table,
  Sparkles,
  Calendar,
  FileCode,
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
    { name: 'Kanban Pipeline', href: '/applications/pipeline', icon: Kanban },
    { name: 'Applications Table', href: '/applications', icon: Table },
    { name: 'AI Analyzer Studio', href: '/ai-analyzer', icon: Sparkles, badge: 'Gemini' },
    { name: 'Interview Schedules', href: '/interviews', icon: Calendar },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {navigation.map((item) => {
          // Precise active route detection:
          // /dashboard -> exact match
          // /applications -> exact match (prevent /applications/pipeline from highlighting /applications)
          // /applications/pipeline -> exact match or startsWith /applications/pipeline
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* API info box */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-800 font-semibold">
          <span>API Cloud Gateway</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          Spring Boot REST API with Gemini 1.5 & WSO2 API Platform Cloud.
        </p>
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-sky-600 font-medium">
          <a
            href="http://localhost:8085/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            <FileCode className="w-3 h-3" />
            Swagger Docs
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] shadow-2xs">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl border-r border-slate-200 z-50 animate-fade-in flex flex-col pt-2">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

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
  Building2,
  FileCode,
  BookOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Kanban Pipeline', href: '/applications/pipeline', icon: Kanban },
    { name: 'Applications Table', href: '/applications', icon: Table },
    { name: 'AI Analyzer Studio', href: '/ai-analyzer', icon: Sparkles, badge: 'Gemini' },
    { name: 'Interview Schedules', href: '/interviews', icon: Calendar },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Cloud & API info box */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>Architecture</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Spring Boot REST API managed via WSO2 Cloud with Gemini 1.5 & Supabase.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-sky-400">
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            <FileCode className="w-3 h-3" />
            Swagger Docs
          </a>
        </div>
      </div>
    </aside>
  );
};

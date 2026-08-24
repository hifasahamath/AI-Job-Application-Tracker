'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '../../components/AppShell';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { ScoreGauge } from '../../components/ScoreGauge';
import { ApplicationModal } from '../../components/ApplicationModal';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { JobApplication, ApplicationStatus, Priority } from '../../types';
import {
  Table as TableIcon,
  Search,
  Filter,
  Plus,
  Building,
  DollarSign,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function ApplicationsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') as ApplicationStatus | null;

  const { success, error } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>(initialStatus || '');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getApplications({
        status: (status as ApplicationStatus) || undefined,
        priority: (priority as Priority) || undefined,
        search: search.trim() || undefined,
        page,
        size,
        sortBy,
        sortDir,
      });
      setApplications(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [status, priority, search, page, size, sortBy, sortDir, error]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this job application?')) return;

    try {
      await api.deleteApplication(id);
      success('Application deleted successfully');
      fetchApplications();
    } catch (err: any) {
      error('Failed to delete application');
    }
  };

  const handleEdit = (app: JobApplication, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingApp(app);
    setIsModalOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <TableIcon className="w-5 h-5" />
              </div>
              All Applications ({totalElements})
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Search, filter, and inspect your full job application history.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Application
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ApplicationStatus | '');
                  setPage(0);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">All Statuses</option>
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as Priority | '');
                setPage(0);
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">All Priorities</option>
              <option value="DREAM_JOB">Dream Job ⭐</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd as 'ASC' | 'DESC');
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="createdAt-DESC">Newest Created</option>
              <option value="appliedDate-DESC">Applied Date</option>
              <option value="deadline-ASC">Deadline (Earliest)</option>
              <option value="salaryMax-DESC">Highest Salary</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Salary Range</th>
                  <th className="px-4 py-3.5">AI Match</th>
                  <th className="px-4 py-3.5">Applied / Deadline</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400">
                      Loading applications data...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p className="text-sm font-bold text-slate-700">No applications match your filter criteria.</p>
                      <p className="text-xs text-slate-500 mt-1">Try resetting filters or adding a new application.</p>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/applications/${app.id}`)}
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors block">
                            {app.jobTitle}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700">{app.company?.name}</span> • {app.workLocationType}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="px-4 py-4">
                        <PriorityBadge priority={app.priority} />
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {app.salaryMin || app.salaryMax ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            {app.salaryMin && app.salaryMax
                              ? `${app.salaryCurrency} ${(app.salaryMin / 1000).toFixed(0)}k - ${(app.salaryMax / 1000).toFixed(0)}k`
                              : `${app.salaryCurrency} ${(app.salaryMin || app.salaryMax! / 1000).toFixed(0)}k`}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {app.latestMatchScore !== undefined && app.latestMatchScore !== null ? (
                          <div className="flex items-center gap-2">
                            <ScoreGauge score={app.latestMatchScore} size="sm" showLabel={false} />
                            <span className="text-xs font-bold text-slate-800">{app.latestMatchScore}%</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not analyzed</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        <div>
                          {app.appliedDate ? (
                            <span className="font-medium text-slate-700">Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-slate-400">Not applied yet</span>
                          )}
                        </div>
                        {app.deadline && (
                          <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                            Due {new Date(app.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleEdit(app, e)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(app.id, e)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/applications/${app.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                            title="View Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {applications.length} of {totalElements} applications
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-700 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-700 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingApp(null);
          }}
          onSuccess={() => {
            fetchApplications();
          }}
          applicationToEdit={editingApp}
        />
      )}
    </AppShell>
  );
}

export default function ApplicationsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ApplicationsListContent />
    </Suspense>
  );
}

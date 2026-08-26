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
  Search,
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
    if (!confirm('Delete this application?')) return;

    try {
      await api.deleteApplication(id);
      success('Application deleted');
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

  const inputClass = "bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";

  const SkeletonTableRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-40" /><div className="h-3 bg-gray-100 rounded w-24 mt-1.5" /></td>
      <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded w-16" /></td>
      <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded w-14" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-20" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-10" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-24" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-16 ml-auto" /></td>
    </tr>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Applications <span className="text-gray-400 font-normal">({totalElements})</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Search, filter, and manage your job applications.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Application
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or company…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className={`${inputClass} w-full pl-9`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ApplicationStatus | '');
                setPage(0);
              }}
              className={`${inputClass} text-xs`}
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

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as Priority | '');
                setPage(0);
              }}
              className={`${inputClass} text-xs`}
            >
              <option value="">All Priorities</option>
              <option value="DREAM_JOB">Dream Job</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd as 'ASC' | 'DESC');
              }}
              className={`${inputClass} text-xs`}
            >
              <option value="createdAt-DESC">Newest</option>
              <option value="appliedDate-DESC">Applied Date</option>
              <option value="deadline-ASC">Deadline</option>
              <option value="salaryMax-DESC">Salary</option>
            </select>
          </div>
        </div>

        {/* Table — Desktop / Card list — Mobile */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-200 hidden md:table-header-group">
                <tr>
                  <th className="px-4 py-3">Company & Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Salary</th>
                  <th className="px-4 py-3 hidden lg:table-cell">AI Match</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Dates</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <>
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                  </>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-gray-700">No applications found</p>
                      <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or add a new application.</p>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className="flex flex-col md:table-row hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 md:border-b-0"
                      onClick={() => router.push(`/applications/${app.id}`)}
                    >
                      <td className="px-3 sm:px-4 py-3 md:py-3.5">
                        <div className="flex items-start justify-between md:block gap-2">
                          <div className="space-y-0.5">
                            <span className="font-medium text-gray-900 block">{app.jobTitle}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Building className="w-3 h-3 text-gray-400" />
                              {app.company?.name} · {app.workLocationType}
                            </span>
                          </div>
                          {/* Mobile-only status+priority badges */}
                          <div className="flex items-center gap-1.5 md:hidden shrink-0">
                            <StatusBadge status={app.status} />
                            <PriorityBadge priority={app.priority} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-1 md:py-3.5 hidden md:table-cell"><StatusBadge status={app.status} /></td>
                      <td className="px-3 sm:px-4 py-1 md:py-3.5 hidden md:table-cell"><PriorityBadge priority={app.priority} /></td>
                      <td className="px-3 sm:px-4 py-1 md:py-3.5 text-xs text-gray-600 hidden lg:table-cell">
                        {app.salaryMin || app.salaryMax ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            {app.salaryMin && app.salaryMax
                              ? `${app.salaryCurrency} ${(app.salaryMin / 1000).toFixed(0)}k–${(app.salaryMax / 1000).toFixed(0)}k`
                              : `${app.salaryCurrency} ${((app.salaryMin || app.salaryMax!) / 1000).toFixed(0)}k`}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-1 md:py-3.5 hidden lg:table-cell">
                        {app.latestMatchScore !== undefined && app.latestMatchScore !== null ? (
                          <div className="flex items-center gap-1.5">
                            <ScoreGauge score={app.latestMatchScore} size="sm" showLabel={false} />
                            <span className="text-xs font-medium text-gray-700">{app.latestMatchScore}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-1 md:py-3.5 text-xs text-gray-500 hidden xl:table-cell">
                        {app.appliedDate ? (
                          <span className="text-gray-600">{new Date(app.appliedDate).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-gray-400">Not applied</span>
                        )}
                        {app.deadline && (
                          <div className="text-xs text-amber-700 font-medium mt-0.5">
                            Due {new Date(app.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2 md:py-3.5 md:text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleEdit(app, e)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(app.id, e)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/applications/${app.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="View"
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

          {/* Pagination */}
          <div className="px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {applications.length} of {totalElements}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-md bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition-colors text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-gray-700">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition-colors text-gray-600"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ApplicationsListContent />
    </Suspense>
  );
}

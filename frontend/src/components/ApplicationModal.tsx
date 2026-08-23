'use client';

import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus, Priority, WorkLocationType } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { X, Sparkles, Building, MapPin, DollarSign, Calendar, Globe, Briefcase } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (app: JobApplication) => void;
  applicationToEdit?: JobApplication | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  applicationToEdit,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('SAVED');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [workLocationType, setWorkLocationType] = useState<WorkLocationType>('REMOTE');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [appliedDate, setAppliedDate] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (applicationToEdit) {
      setCompanyName(applicationToEdit.company?.name || '');
      setJobTitle(applicationToEdit.jobTitle || '');
      setJobUrl(applicationToEdit.jobUrl || '');
      setJobDescription(applicationToEdit.jobDescription || '');
      setStatus(applicationToEdit.status || 'SAVED');
      setPriority(applicationToEdit.priority || 'MEDIUM');
      setWorkLocationType(applicationToEdit.workLocationType || 'REMOTE');
      setSalaryMin(applicationToEdit.salaryMin ? applicationToEdit.salaryMin.toString() : '');
      setSalaryMax(applicationToEdit.salaryMax ? applicationToEdit.salaryMax.toString() : '');
      setSalaryCurrency(applicationToEdit.salaryCurrency || 'USD');
      setAppliedDate(applicationToEdit.appliedDate || '');
      setDeadline(applicationToEdit.deadline || '');
    } else {
      setCompanyName('');
      setJobTitle('');
      setJobUrl('');
      setJobDescription('');
      setStatus('SAVED');
      setPriority('MEDIUM');
      setWorkLocationType('REMOTE');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency('USD');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setDeadline('');
    }
  }, [applicationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      error('Company Name and Job Title are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        jobUrl: jobUrl.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
        status,
        priority,
        workLocationType,
        salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
        salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
        salaryCurrency,
        appliedDate: appliedDate || undefined,
        deadline: deadline || undefined,
      };

      let result: JobApplication;
      if (applicationToEdit) {
        result = await api.updateApplication(applicationToEdit.id, payload);
        success('Application updated successfully');
      } else {
        result = await api.createApplication(payload);
        success('Application created successfully');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400" />
              {applicationToEdit ? 'Edit Job Application' : 'New Job Application'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep track of company, pipeline stage, and requirements.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Google, Spotify"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="DREAM_JOB">Dream Job ⭐</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Mode
              </label>
              <select
                value={workLocationType}
                onChange={(e) => setWorkLocationType(e.target.value as WorkLocationType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Min
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  placeholder="e.g. 130000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Max
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  placeholder="e.g. 160000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Currency
              </label>
              <input
                type="text"
                placeholder="USD"
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Posting URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Application / Applied Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Description
            </label>
            <textarea
              rows={4}
              placeholder="Paste the job description text here (used by Gemini AI to evaluate matching score and generate interview questions)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <span>{applicationToEdit ? 'Save Changes' : 'Create Application'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus, Priority, WorkLocationType } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  X,
  Building,
  DollarSign,
  Calendar,
  Globe,
  Briefcase,
  FileText,
  Upload,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2
} from 'lucide-react';

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
  const { user } = useAuth();
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

  // CV Mode: 'master' or 'custom'
  const [cvMode, setCvMode] = useState<'master' | 'custom'>('master');
  const [customResumeText, setCustomResumeText] = useState('');
  const [showMasterPreview, setShowMasterPreview] = useState(false);

  const isEditing = Boolean(applicationToEdit && applicationToEdit.id && applicationToEdit.id.trim() !== '');

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

      if (applicationToEdit.customResumeText && applicationToEdit.customResumeText.trim() !== '') {
        setCvMode('custom');
        setCustomResumeText(applicationToEdit.customResumeText);
      } else {
        setCvMode('master');
        setCustomResumeText('');
      }
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
      setCvMode('master');
      setCustomResumeText('');
    }
  }, [applicationToEdit, isOpen]);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          setCustomResumeText(text);
          success(`Loaded tailored resume from ${file.name}`);
        }
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(buffer);
        const cleaned = rawText.replace(/[^\x20-\x7E\t\n\r]/g, ' ').replace(/ {2,}/g, ' ').trim();
        if (cleaned.length > 50) {
          setCustomResumeText(cleaned);
          success(`Extracted text from ${file.name}`);
        } else {
          error(`Could not extract plain text from ${file.name}. Please paste text manually.`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

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
        customResumeText: cvMode === 'custom' && customResumeText.trim() ? customResumeText.trim() : undefined,
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
      if (isEditing) {
        result = await api.updateApplication(applicationToEdit!.id, payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <Briefcase className="w-4 h-4" />
              </div>
              {isEditing ? 'Edit Job Application' : 'New Job Application'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep track of company, role details, custom resume, and requirements.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Google, Spotify"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="DREAM_JOB">Dream Job ⭐</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Mode
              </label>
              <select
                value={workLocationType}
                onChange={(e) => setWorkLocationType(e.target.value as WorkLocationType)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Min
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="e.g. 130000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Max
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="e.g. 160000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <input
                type="text"
                placeholder="USD"
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Posting URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description
            </label>
            <textarea
              rows={3}
              placeholder="Paste the job description text here (used by Gemini AI to evaluate matching score and generate interview questions)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* CV / Resume Selection for this Job */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                Candidate Resume / CV for this Job
              </label>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCvMode('master')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    cvMode === 'master'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Use Master Profile CV
                </button>
                <button
                  type="button"
                  onClick={() => setCvMode('custom')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    cvMode === 'custom'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tailor CV for this Job
                </button>
              </div>
            </div>

            {cvMode === 'master' ? (
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Linked to Master CV Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMasterPreview(!showMasterPreview)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700"
                  >
                    {showMasterPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showMasterPreview ? 'Hide Master CV' : 'Preview Master CV'}
                  </button>
                </div>

                {showMasterPreview && (
                  <pre className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-700 whitespace-pre-wrap font-sans max-h-36 overflow-y-auto border border-slate-200">
                    {user?.resumeText || user?.skillsSummary || 'No Master CV text set in Profile. Visit "Profile & Master CV" to add one.'}
                  </pre>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Custom tailored resume text for this specific employer:</span>
                  <div className="flex items-center gap-2">
                    {user?.resumeText && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomResumeText(user.resumeText || '');
                          success('Copied Master CV into custom editor!');
                        }}
                        className="inline-flex items-center gap-1 text-sky-600 font-bold hover:underline"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Master CV
                      </button>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline">
                      <Upload className="w-3 h-3" />
                      Upload File
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,.doc,.md"
                        onChange={handleCustomFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                  placeholder="Paste or customize your resume specifically tailored to this company and position..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Application'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

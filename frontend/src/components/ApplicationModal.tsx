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
  FileText,
  Upload,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  AlertCircle
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

  const [extractingCustom, setExtractingCustom] = useState(false);

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingCustom(true);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          if (text) {
            setCustomResumeText(text);
            success(`Loaded resume from ${file.name}`);
          }
          setExtractingCustom(false);
        };
        reader.readAsText(file);
      } else {
        const extracted = await api.extractResumeText(file);
        if (extracted && extracted.trim()) {
          setCustomResumeText(extracted.trim());
          success(`Extracted text from ${file.name}`);
        } else {
          error('No readable text found in document.');
        }
        setExtractingCustom(false);
      }
    } catch (err: any) {
      error(err.message || `Failed to extract text from ${file.name}.`);
      setExtractingCustom(false);
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
        success('Application updated');
      } else {
        result = await api.createApplication(payload);
        success('Application created');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-[2px] animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg p-5 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEditing ? 'Edit Application' : 'New Application'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Track company, role, and resume details.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)} className={inputClass}>
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
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="DREAM_JOB">Dream Job</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Work Mode</label>
              <select value={workLocationType} onChange={(e) => setWorkLocationType(e.target.value as WorkLocationType)} className={inputClass}>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
          </div>

          {status === 'INTERVIEW' && (
            <div className="col-span-full mt-2 text-xs text-blue-700 bg-blue-50 p-2.5 rounded-md border border-blue-200 flex items-start gap-2">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <p>
                <strong>Note:</strong> Setting the status here updates the application label, but doesn't add an interview to your calendar.<br/>
                After saving, click this application's row to open its details page, then go to the <strong>Interviews</strong> tab to schedule the date and time!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Salary Min</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="number" placeholder="130000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Salary Max</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="number" placeholder="160000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <input type="text" placeholder="USD" value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="url" placeholder="https://..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Applied Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Job Description</label>
            <textarea
              rows={3}
              placeholder="Paste the job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </div>

          {/* CV Section */}
          <div className="p-4 rounded-md bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-500" />
                Resume for this job
              </label>
              <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-md border border-gray-200">
                <button
                  type="button"
                  onClick={() => setCvMode('master')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    cvMode === 'master' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Master CV
                </button>
                <button
                  type="button"
                  onClick={() => setCvMode('custom')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    cvMode === 'custom' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {cvMode === 'master' ? (
              <div className="p-3 rounded-md bg-white border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Using Master CV from profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMasterPreview(!showMasterPreview)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {showMasterPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showMasterPreview ? 'Hide' : 'Preview'}
                  </button>
                </div>

                {showMasterPreview && (
                  user?.resumeText && user.resumeText.trim() ? (
                    <pre className="p-3 rounded-md bg-gray-50 text-xs text-gray-800 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto border border-gray-100 leading-relaxed">
                      {user.resumeText}
                    </pre>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-md text-amber-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>No Master CV saved yet. Visit <strong>Profile & Resume</strong> to add one.</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Custom resume for this position:</span>
                  <div className="flex items-center gap-2">
                    {user?.resumeText && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomResumeText(user.resumeText || '');
                          success('Copied Master CV');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Master CV
                      </button>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                      <Upload className={`w-3 h-3 ${extractingCustom ? 'animate-pulse' : ''}`} />
                      {extractingCustom ? 'Extracting…' : 'Upload'}
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx,.doc,.md"
                        disabled={extractingCustom}
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
                  placeholder="Paste or customize your resume for this position…"
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

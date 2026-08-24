'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Link from 'next/link';
import {
  User,
  FileText,
  Upload,
  Save,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Copy,
  RefreshCw,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skillsSummary, setSkillsSummary] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setTargetRole(user.targetRole || '');
      setSkillsSummary(user.skillsSummary || '');
      setResumeText(user.resumeText || '');
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Read text from file
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setResumeText(text);
          success(`Imported text from ${file.name}`);
        }
      };
      reader.readAsText(file);
    } else {
      // For PDF, DOCX or other text-readable formats, attempt text extraction via FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(buffer);
        // Clean non-printable characters for display
        const cleaned = rawText
          .replace(/[^\x20-\x7E\t\n\r]/g, ' ')
          .replace(/ {2,}/g, ' ')
          .trim();

        if (cleaned.length > 50) {
          setResumeText(cleaned);
          success(`Extracted text from ${file.name}`);
        } else {
          // Fallback guidance
          error(`Could not automatically extract plain text from ${file.name}. Please copy and paste your resume text below.`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Full name is required');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        targetRole: targetRole.trim() || undefined,
        skillsSummary: skillsSummary.trim() || undefined,
        resumeText: resumeText.trim() || undefined,
      });
      success('Candidate Profile & Master CV updated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
  const charCount = resumeText.length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 text-white">
                <FileText className="w-5 h-5" />
              </div>
              Candidate Profile & Master CV Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Manage your default Master CV, core technical skills, and candidate profile used for Gemini AI job matching.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai-analyzer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Test with AI Analyzer
            </Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Candidate Info Grid */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600" />
              Candidate Profile Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Job Title / Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Software Engineer"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Core Skills & Technologies Summary</span>
                <span className="text-[11px] text-slate-400 font-normal">Comma-separated list</span>
              </label>
              <textarea
                rows={2}
                value={skillsSummary}
                onChange={(e) => setSkillsSummary(e.target.value)}
                placeholder="e.g. Java 21, Spring Boot, React, TypeScript, Next.js, PostgreSQL, Docker, Kubernetes, AWS, Gemini AI"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Master CV / Resume Management */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  Master CV / Resume Document
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  This master CV is used as the primary baseline for job evaluation and application creation.
                </p>
              </div>

              {/* View/Edit Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'editor'
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Edit / Type CV
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'preview'
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              </div>
            </div>

            {/* Upload Toolbar Banner */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-2xs shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-sky-950">Upload or Import Resume File</h3>
                  <p className="text-[11px] text-sky-700">
                    Import directly from a <code className="font-mono bg-white px-1 py-0.5 rounded border border-sky-200">.txt</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-sky-200">.pdf</code>, or <code className="font-mono bg-white px-1 py-0.5 rounded border border-sky-200">.docx</code> file.
                  </p>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-sky-700 hover:bg-sky-100/50 border border-sky-300 shadow-2xs transition-all active:scale-95 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                Browse File
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.doc,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {fileName && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Loaded file: <strong>{fileName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setFileName(null)}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 1: Editor */}
            {activeTab === 'editor' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Copy/Paste or Type your complete Resume / CV text:</span>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                  </div>
                </div>

                <textarea
                  rows={16}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={`Paste full resume text here (Work history, education, projects, skills, certifications)...\n\nExample:\nJOHN DOE — SENIOR SOFTWARE ENGINEER\nEmail: john@example.com | LinkedIn: linkedin.com/in/johndoe\n\nPROFESSIONAL SUMMARY\n5+ years designing and building scalable cloud services with Java, Spring Boot, React, and TypeScript...\n\nTECHNICAL SKILLS\n- Languages: Java 21, TypeScript, Python, SQL\n- Frameworks: Spring Boot, Next.js, Tailwind CSS\n- Databases: PostgreSQL, Supabase, Redis\n\nWORK EXPERIENCE\nSenior Engineer @ Tech Corp (2022-Present)\n- Built high-throughput microservices...`}
                  className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors leading-relaxed"
                />
              </div>
            )}

            {/* Tab 2: Live Formatted Preview */}
            {activeTab === 'preview' && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    Master CV Formatted Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resumeText);
                      success('Copied CV text to clipboard!');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Text
                  </button>
                </div>

                {resumeText.trim() ? (
                  <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs max-h-96 overflow-y-auto">
                    {resumeText}
                  </pre>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No Master CV text added yet. Switch to the <strong>Edit / Type CV</strong> tab to paste or upload your resume.
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50 active:scale-95"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving Profile & CV...' : 'Save Profile & Master CV'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

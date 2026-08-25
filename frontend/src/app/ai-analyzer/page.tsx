'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { ScoreGauge } from '../../components/ScoreGauge';
import { ApplicationModal } from '../../components/ApplicationModal';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AiAnalysis } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Briefcase,
  History,
  Plus,
  RefreshCw,
  FileText,
  Copy,
  Upload,
  EyeOff,
  Trash2
} from 'lucide-react';

export default function AiAnalyzerPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState(user?.skillsSummary || '');

  const [currentAnalysis, setCurrentAnalysis] = useState<AiAnalysis | null>(null);
  const [history, setHistory] = useState<AiAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [resumeTab, setResumeTab] = useState<'master' | 'custom'>('master');
  const [showMasterCv, setShowMasterCv] = useState(true);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (user?.resumeText) {
      setResumeText(user.resumeText);
    } else if (user?.skillsSummary) {
      setResumeText(user.skillsSummary);
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getAiHistory();
      setHistory(data);
      if (data.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(data[0]);
      }
    } catch (err: any) {
      // Non-blocking
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all past analyses? This cannot be undone.')) {
      return;
    }

    setClearingHistory(true);
    try {
      await api.clearAiHistory();
      setHistory([]);
      setCurrentAnalysis(null);
      success('History cleared successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to clear history.');
    } finally {
      setClearingHistory(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      error('Job description is required.');
      return;
    }

    setLoading(true);
    setCurrentAnalysis(null);
    try {
      const finalResumeText = resumeTab === 'master' 
        ? (user?.resumeText || user?.skillsSummary || '') 
        : resumeText;

      const result = await api.analyzeJob({
        jobTitle: jobTitle.trim() || undefined,
        companyName: companyName.trim() || undefined,
        jobDescription: jobDescription.trim(),
        resumeText: finalResumeText.trim() || undefined,
      });

      setCurrentAnalysis(result);
      setHistory((prev) => [result, ...prev]);
      success('AI analysis completed.');
    } catch (err: any) {
      error(err.message || 'AI Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            setResumeText(text);
            success(`Imported text from ${file.name}`);
          }
          setExtracting(false);
        };
        reader.readAsText(file);
      } else {
        const extracted = await api.extractResumeText(file);
        if (extracted && extracted.trim()) {
          setResumeText(extracted.trim());
          success(`Extracted text from ${file.name}`);
        } else {
          error('No readable text found in document.');
        }
        setExtracting(false);
      }
    } catch (err: any) {
      error(err.message || `Failed to extract text from ${file.name}.`);
      setExtracting(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-500" />
              AI Analyzer
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Evaluate job descriptions against your resume and calculate fit scores.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                Target Job & Profile
              </h2>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Backend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Paste full job posting requirements..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Resume for this job
                    </span>
                    <div className="flex bg-white rounded-md border border-gray-200 p-0.5">
                      <button
                        type="button"
                        onClick={() => setResumeTab('master')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          resumeTab === 'master' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Master CV
                      </button>
                      <button
                        type="button"
                        onClick={() => setResumeTab('custom')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          resumeTab === 'custom' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white">
                    {resumeTab === 'master' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Using Master CV from profile
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setShowMasterCv(!showMasterCv)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            {showMasterCv ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {showMasterCv && (
                          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                              {user?.resumeText || user?.skillsSummary || 'No Master CV found in profile.'}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Custom resume for this position:</span>
                          <div className="flex items-center gap-3 text-xs font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                const masterText = user?.resumeText || user?.skillsSummary || '';
                                setResumeText(masterText);
                                success('Copied Master CV');
                              }}
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy Master CV
                            </button>
                            <label className="cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
                              <Upload className={`w-3.5 h-3.5 ${extracting ? 'animate-bounce' : ''}`} />
                              {extracting ? 'Upload' : 'Upload'}
                              <input
                                type="file"
                                accept=".txt,.pdf,.docx,.doc,.md"
                                disabled={extracting}
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <textarea
                          rows={6}
                          placeholder="Paste or customize your resume for this position..."
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className={`${inputClass} resize-none leading-relaxed text-sm`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Analyzing…' : 'Run Analysis'}
                </button>
              </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Past Analyses
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearHistory}
                    disabled={clearingHistory || history.length === 0}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50 p-1 rounded transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${clearingHistory ? 'animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={fetchHistory}
                    disabled={loadingHistory}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-50 p-1 rounded transition-colors"
                    title="Refresh history"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No past history.</p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentAnalysis(item)}
                      className={`w-full text-left p-2.5 rounded-md border text-sm transition-colors flex items-center justify-between ${
                        currentAnalysis?.id === item.id
                          ? 'bg-gray-50 border-gray-300 text-gray-900'
                          : 'bg-white border-transparent hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-gray-900 block truncate">{item.jobTitle || 'Role'}</span>
                        <span className="text-xs text-gray-500">{item.companyName || 'Company'}</span>
                      </div>
                      <span className="font-medium text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-700 bg-white">
                        {item.matchScore}%
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {!currentAnalysis ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h2 className="text-sm font-medium text-gray-900">Analysis Engine Ready</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Enter a job description and run the AI analysis to generate a match score, skills breakdown, and interview prep.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-gray-100">
                    <ScoreGauge score={currentAnalysis.matchScore} size="lg" />
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {currentAnalysis.jobTitle || 'Target Position'}
                        </h2>
                        <button
                          onClick={() => setIsAppModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Track as Application
                        </button>
                      </div>
                      <span className="text-sm text-gray-500 block">
                        {currentAnalysis.companyName || 'Target Company'}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed pt-1">
                        {currentAnalysis.analysisSummary}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <div className="p-4 rounded-md bg-emerald-50 space-y-2">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Matching Skills ({currentAnalysis.matchingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.matchingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-white text-emerald-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-amber-50 space-y-2">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Missing Skills ({currentAnalysis.missingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.missingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-white text-amber-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {currentAnalysis.requirementAnalysis && currentAnalysis.requirementAnalysis.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Detailed Requirement Mapping
                      </h3>
                      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-medium">
                            <tr>
                              <th className="p-3 w-1/3">Job Requirement</th>
                              <th className="p-3 w-1/3">CV Evidence</th>
                              <th className="p-3 w-1/4">Match Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {currentAnalysis.requirementAnalysis.map((req, i) => (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 align-top">
                                  <span className="block font-medium text-gray-900 mb-1">{req.requirement}</span>
                                  <span className="text-[10px] uppercase font-bold text-gray-400">{req.category} • {req.importance}</span>
                                </td>
                                <td className="p-3 align-top text-xs text-gray-600">
                                  {req.cvEvidence}
                                </td>
                                <td className="p-3 align-top">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                    req.matchStatus === 'Matched' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    req.matchStatus === 'Missing' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    req.matchStatus === 'Partially Matched' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                    {req.matchStatus}
                                  </span>
                                  <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">{req.reasoning}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {currentAnalysis.cvImprovements && currentAnalysis.cvImprovements.length > 0 && (
                    <div className="mt-4 p-4 rounded-md bg-blue-50 space-y-3">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-blue-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Actionable CV Improvements ({currentAnalysis.cvImprovements.length})
                      </h3>
                      <ul className="space-y-2">
                        {currentAnalysis.cvImprovements.map((improvement, i) => (
                          <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                            <span className="mt-1 block w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                            <span className="leading-relaxed">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {currentAnalysis.preparationAreas && currentAnalysis.preparationAreas.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      Preparation Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentAnalysis.preparationAreas.map((area, idx) => (
                        <div key={idx} className="p-3.5 rounded-md bg-gray-50 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{area.topic}</span>
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                                area.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {area.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{area.actionableAdvice}</p>
                          {area.recommendedResources && area.recommendedResources.length > 0 && (
                            <div className="pt-1.5 border-t border-gray-200 text-xs text-gray-500">
                              <span className="font-medium">Resources:</span> {area.recommendedResources.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentAnalysis.interviewQuestions && currentAnalysis.interviewQuestions.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      Interview Questions
                    </h3>
                    <div className="space-y-3">
                      {currentAnalysis.interviewQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-md bg-gray-50 space-y-2">
                          <span className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {q.category}
                          </span>
                          <p className="text-sm font-medium text-gray-900">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-md bg-white border border-gray-200">
                              <span className="font-medium text-gray-700 block mb-1">Why they ask:</span>
                              <p className="text-gray-600">{q.rationale}</p>
                            </div>
                            <div className="p-3 rounded-md bg-blue-50 border border-blue-100">
                              <span className="font-medium text-blue-800 block mb-1">Key points:</span>
                              <p className="text-blue-900">{q.suggestedAnswerTip}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAppModalOpen && currentAnalysis && (
        <ApplicationModal
          isOpen={isAppModalOpen}
          onClose={() => setIsAppModalOpen(false)}
          onSuccess={() => {
            success('Application created with AI analysis linked.');
          }}
          applicationToEdit={{
            id: '',
            userId: user?.id || '',
            jobTitle: currentAnalysis.jobTitle || 'Software Engineer',
            company: { id: '', name: currentAnalysis.companyName || 'Company' },
            status: 'SAVED',
            workLocationType: 'REMOTE',
            salaryCurrency: 'USD',
            priority: 'HIGH',
            jobDescription: jobDescription,
            createdAt: '',
            updatedAt: '',
          }}
        />
      )}
    </AppShell>
  );
}

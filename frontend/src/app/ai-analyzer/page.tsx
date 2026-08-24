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
  RefreshCw
} from 'lucide-react';

export default function AiAnalyzerPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [companyName, setCompanyName] = useState('Target Tech Corp');
  const [jobDescription, setJobDescription] = useState(
    `We are looking for a Senior Full Stack Engineer to lead backend microservices and frontend web applications.
Requirements:
- 5+ years of experience with Java, Spring Boot, and REST API architecture
- Strong proficiency in modern React, TypeScript, Next.js, and Tailwind CSS
- Hands-on expertise in PostgreSQL database modeling, query optimization, and transaction handling
- Experience with Docker containerization, CI/CD, and API Gateway integration (e.g. WSO2 API Platform Cloud)
- Knowledge of LLM / AI API integration (Google Gemini, OpenAI) and automated testing with JUnit and Mockito.`
  );
  const [resumeText, setResumeText] = useState(
    user?.skillsSummary ||
      'Experienced Software Engineer with deep expertise in Java 21, Spring Boot, Spring Security, React 18, Next.js, TypeScript, PostgreSQL, and Docker containerization. Built distributed microservices and integrated Google Gemini API models.'
  );

  const [currentAnalysis, setCurrentAnalysis] = useState<AiAnalysis | null>(null);
  const [history, setHistory] = useState<AiAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      error('Job description is required for AI evaluation.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyzeJob({
        jobTitle: jobTitle.trim() || undefined,
        companyName: companyName.trim() || undefined,
        jobDescription: jobDescription.trim(),
        resumeText: resumeText.trim() || undefined,
      });

      setCurrentAnalysis(result);
      setHistory((prev) => [result, ...prev]);
      success('Gemini AI Job Analysis completed successfully!');
    } catch (err: any) {
      error(err.message || 'AI Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Gemini AI Job Analyzer Studio
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Evaluate job descriptions against your resume, calculate fit score, pinpoint skill gaps, and generate tailored interview prep.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                Target Job & Profile Input
              </h2>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Backend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe / Meta"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={7}
                    required
                    placeholder="Paste full job posting requirements and responsibilities here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Your Resume / Skills Summary</span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-filled from profile</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste your CV text or core technical skills..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className={`w-4 h-4 text-sky-200 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Analyzing with Gemini AI...' : 'Run Strategic AI Analysis'}
                </button>
              </form>
            </div>

            {/* Analysis History Widget */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Previous Analyses ({history.length})
                </h3>
                <button
                  onClick={fetchHistory}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                  title="Refresh history"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No past analysis history.</p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentAnalysis(item)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        currentAnalysis?.id === item.id
                          ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-2xs font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-900 block truncate">{item.jobTitle || 'Role'}</span>
                        <span className="text-[11px] text-slate-500">{item.companyName || 'Company'}</span>
                      </div>
                      <span className="font-extrabold text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-sky-700 shadow-2xs">
                        {item.matchScore}%
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!currentAnalysis ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AI Analysis Engine Ready</h2>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed font-medium">
                  Enter a target job description and run the Gemini AI analysis to generate a calibrated match score, skills alignment breakdown, preparation roadmap, and tailored interview questions.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Score and Executive Overview */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                    <ScoreGauge score={currentAnalysis.matchScore} size="lg" />
                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {currentAnalysis.jobTitle || 'Target Position'}
                        </h2>
                        <button
                          onClick={() => setIsAppModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Track as Application
                        </button>
                      </div>
                      <span className="text-xs text-sky-700 font-bold block">
                        {currentAnalysis.companyName || 'Target Company'}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed pt-2 font-normal">
                        {currentAnalysis.analysisSummary}
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Matching Skills ({currentAnalysis.matchingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.matchingSkills?.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Missing Skills & Gaps ({currentAnalysis.missingSkills?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.missingSkills?.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-amber-800 border border-amber-200 shadow-2xs"
                          >
                            ⚠ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Prep Roadmap */}
                {currentAnalysis.preparationAreas && currentAnalysis.preparationAreas.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-600" />
                      Recommended Preparation Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {currentAnalysis.preparationAreas.map((area, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{area.topic}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                area.priority === 'HIGH'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {area.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">{area.actionableAdvice}</p>
                          {area.recommendedResources && area.recommendedResources.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 text-[11px] text-sky-600 font-medium">
                              <span className="font-bold text-slate-500 block text-[10px]">Resources:</span>
                              {area.recommendedResources.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Interview Questions */}
                {currentAnalysis.interviewQuestions && currentAnalysis.interviewQuestions.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      Tailored Interview Questions & Answering Strategies
                    </h3>
                    <div className="space-y-4 mt-4">
                      {currentAnalysis.interviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                        >
                          <span className="inline-block text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {q.category} Round Question
                          </span>
                          <p className="text-sm font-bold text-slate-900">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-700 block text-[11px] mb-1">
                                Evaluation Objective:
                              </span>
                              <p className="text-slate-600 leading-relaxed font-normal">{q.rationale}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 shadow-2xs">
                              <span className="font-bold text-sky-800 block text-[11px] mb-1">
                                Key Response Points:
                              </span>
                              <p className="text-sky-900 leading-relaxed font-normal">{q.suggestedAnswerTip}</p>
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
            success('Application created with AI analysis linked!');
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

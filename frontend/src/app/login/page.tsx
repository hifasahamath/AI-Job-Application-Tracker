'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      success('Welcome back! Authentication successful.');
      router.push('/dashboard');
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await loginDemo();
      success('Logged in with Demo Candidate account!');
      router.push('/dashboard');
    } catch (err: any) {
      error(err.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to CareerPulse <span className="text-sky-400">AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Your centralized job search tracker with Gemini AI matching
          </p>
        </div>

        {/* Login card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Quick Demo button */}
          <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-sky-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-sky-300 font-medium">
              <Zap className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Interview Demo Mode</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm disabled:opacity-50"
            >
              {demoLoading ? 'Launching...' : '1-Click Demo'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-sky-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>

        {/* WSO2 Managed cloud badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Protected via WSO2 API Platform Cloud Gateway</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '../../components/AppShell';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import Link from 'next/link';
import {
  User,
  FileText,
  Upload,
  Save,
  Sparkles,
  Eye,
  CheckCircle2,
  Copy,
  X,
  Camera,
  Trash2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, updateUser } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skillsSummary, setSkillsSummary] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [extracting, setExtracting] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [deletingPic, setDeletingPic] = useState(false);
  const picInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setTargetRole(user.targetRole || '');
      setSkillsSummary(user.skillsSummary || '');
      setResumeText(user.resumeText || '');
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
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
      error(err.message || `Failed to extract text from ${file.name}. Paste directly.`);
      setExtracting(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Please select an image file (PNG, JPG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Image must be smaller than 5MB');
      return;
    }

    setUploadingPic(true);
    try {
      const updatedUser = await api.uploadProfilePicture(file);
      updateUser(updatedUser);
      success('Profile picture updated');
    } catch (err: any) {
      error(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPic(false);
      // Reset the input so the same file can be re-selected
      if (picInputRef.current) picInputRef.current.value = '';
    }
  };

  const handleProfilePicDelete = async () => {
    setDeletingPic(true);
    try {
      const updatedUser = await api.deleteProfilePicture();
      updateUser(updatedUser);
      success('Profile picture removed');
    } catch (err: any) {
      error(err.message || 'Failed to remove profile picture');
    } finally {
      setDeletingPic(false);
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
      success('Profile & CV updated');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
  const charCount = resumeText.length;

  const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
              <FileText className="w-6 h-6 text-gray-400" />
              Profile & Master CV
            </h1>
            <p className="text-base text-gray-500 mt-1">
              Manage your candidate profile used for AI job matching.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai-analyzer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Test Analyzer
            </Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Candidate Info + Profile Picture */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
              <User className="w-5 h-5 text-gray-400" />
              Candidate Profile
            </h2>

            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
              <div className="relative group">
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-4 ring-gray-100 shadow-sm">
                    <span className="text-3xl font-bold text-gray-400">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}

                {/* Overlay upload button */}
                <button
                  type="button"
                  onClick={() => picInputRef.current?.click()}
                  disabled={uploadingPic}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Camera className={`w-6 h-6 text-white ${uploadingPic ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, GIF or WebP. Max 5MB.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => picInputRef.current?.click()}
                    disabled={uploadingPic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all disabled:opacity-50"
                  >
                    <Camera className={`w-3.5 h-3.5 ${uploadingPic ? 'animate-spin' : ''}`} />
                    {uploadingPic ? 'Uploading...' : user?.profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>

                  {user?.profilePictureUrl && (
                    <button
                      type="button"
                      onClick={handleProfilePicDelete}
                      disabled={deletingPic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${deletingPic ? 'animate-spin' : ''}`} />
                      {deletingPic ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={picInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleProfilePicUpload}
                className="hidden"
              />
            </div>

            {/* Name & Role Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Core Skills Summary
              </label>
              <textarea
                rows={2}
                value={skillsSummary}
                onChange={(e) => setSkillsSummary(e.target.value)}
                placeholder="e.g. Java, React, TypeScript, PostgreSQL..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Master CV Management */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Master CV Document
                </h2>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100 border border-gray-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'editor'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Edit Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Upload Toolbar */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gray-900 text-white shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Import Resume File</h3>
                  <p className="text-xs text-gray-500">
                    Supports <code className="font-mono text-gray-600 bg-gray-200 px-1 py-0.5 rounded">.txt</code>, <code className="font-mono text-gray-600 bg-gray-200 px-1 py-0.5 rounded">.pdf</code>, <code className="font-mono text-gray-600 bg-gray-200 px-1 py-0.5 rounded">.docx</code>
                  </p>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 transition-colors shrink-0">
                <Upload className={`w-3.5 h-3.5 ${extracting ? 'animate-bounce' : ''}`} />
                {extracting ? 'Extracting...' : 'Browse File'}
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.doc,.md"
                  disabled={extracting}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {fileName && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 text-green-800 border border-green-200 text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Loaded: {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => setFileName(null)}
                  className="text-green-700 hover:text-green-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Tab: Editor */}
            {activeTab === 'editor' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Copy/Paste your resume content:</span>
                  <div className="flex items-center gap-2 font-medium">
                    <span>{wordCount} words</span>
                    <span>·</span>
                    <span>{charCount} chars</span>
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste full resume text here..."
                  className={`${inputClass} font-mono leading-relaxed resize-none`}
                />
              </div>
            )}

            {/* Tab: Preview */}
            {activeTab === 'preview' && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resumeText);
                      success('Copied to clipboard');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                {resumeText.trim() ? (
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed bg-white p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {resumeText}
                  </pre>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-500">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No CV text added. Switch to "Edit Text" to paste.
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

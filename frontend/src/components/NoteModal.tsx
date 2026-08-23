'use client';

import React, { useState } from 'react';
import { ApplicationNote, NoteCategory } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { X, FileText, Tag } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (note: ApplicationNote) => void;
  applicationId: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  applicationId,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('GENERAL');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      error('Note content is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.addNote({
        applicationId,
        title: title.trim() || undefined,
        content: content.trim(),
        category,
      });

      success('Note added successfully');
      onSuccess(result);
      setTitle('');
      setContent('');
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Add Application Note
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="GENERAL">General Notes</option>
                <option value="FOLLOW_UP">Follow-Up Action</option>
                <option value="INTERVIEW_PREP">Interview Preparation</option>
                <option value="OFFER_DETAILS">Offer & Compensation Details</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Call with recruiter, Team tech stack notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Note Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Type your notes, recruiter feedback, salary notes, or action items..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
              {loading ? <span>Saving...</span> : <span>Add Note</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { ApplicationNote, NoteCategory } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { X } from 'lucide-react';

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

      success('Note added');
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

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-[2px] animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Add Note</h2>
            <p className="text-xs text-gray-500 mt-0.5">Record feedback or prep notes</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className={labelClass}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as NoteCategory)} className={inputClass}>
              <option value="GENERAL">General</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="INTERVIEW_PREP">Interview Prep</option>
              <option value="OFFER_DETAILS">Offer Details</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Title (optional)</label>
            <input
              type="text"
              placeholder="e.g. Call with recruiter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Your notes…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClass} resize-none leading-relaxed`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

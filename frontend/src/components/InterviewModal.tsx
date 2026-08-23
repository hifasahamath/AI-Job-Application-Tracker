'use client';

import React, { useState, useEffect } from 'react';
import { Interview, RoundType, InterviewStatus } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { X, Calendar, Clock, Video, UserCheck, FileText } from 'lucide-react';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (interview: Interview) => void;
  applicationId: string;
  interviewToEdit?: Interview | null;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  applicationId,
  interviewToEdit,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [roundType, setRoundType] = useState<RoundType>('TECHNICAL');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerNames, setInterviewerNames] = useState('');
  const [status, setStatus] = useState<InterviewStatus>('SCHEDULED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (interviewToEdit) {
      setRoundType(interviewToEdit.roundType);
      setRoundNumber(interviewToEdit.roundNumber || 1);
      if (interviewToEdit.scheduledAt) {
        const dt = new Date(interviewToEdit.scheduledAt);
        setDate(dt.toISOString().split('T')[0]);
        setTime(dt.toTimeString().substring(0, 5));
      }
      setDurationMinutes(interviewToEdit.durationMinutes || 45);
      setMeetingLink(interviewToEdit.meetingLink || '');
      setInterviewerNames(interviewToEdit.interviewerNames || '');
      setStatus(interviewToEdit.status || 'SCHEDULED');
      setNotes(interviewToEdit.notes || '');
    } else {
      setRoundType('TECHNICAL');
      setRoundNumber(1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTime('14:00');
      setDurationMinutes(45);
      setMeetingLink('');
      setInterviewerNames('');
      setStatus('SCHEDULED');
      setNotes('');
    }
  }, [interviewToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      error('Date and time are required.');
      return;
    }

    setLoading(true);
    try {
      const scheduledAtIso = new Date(`${date}T${time}:00`).toISOString();

      const payload = {
        applicationId,
        roundType,
        roundNumber,
        scheduledAt: scheduledAtIso,
        durationMinutes,
        meetingLink: meetingLink.trim() || undefined,
        interviewerNames: interviewerNames.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      };

      let result: Interview;
      if (interviewToEdit) {
        result = await api.updateInterview(interviewToEdit.id, payload);
        success('Interview updated successfully');
      } else {
        result = await api.scheduleInterview(payload);
        success('Interview scheduled successfully');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            {interviewToEdit ? 'Edit Interview Round' : 'Schedule Interview Round'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Round Type
              </label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value as RoundType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="SCREENING">Screening</option>
                <option value="TECHNICAL">Technical Coding</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="BEHAVIORAL">Behavioral / Culture</option>
                <option value="FINAL_ROUND">Final Round / Executive</option>
                <option value="HR">HR & Offer Discussion</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Round Number
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={roundNumber}
                onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins (1 hr)</option>
                  <option value={90}>90 mins</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InterviewStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Meeting Video Link
            </label>
            <div className="relative">
              <Video className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="url"
                placeholder="https://meet.google.com/... or Zoom link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Interviewer Name(s) & Titles
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Sarah Connor (Staff Engineer), John Reese (EM)"
                value={interviewerNames}
                onChange={(e) => setInterviewerNames(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Interview Notes & Preparation Targets
            </label>
            <textarea
              rows={3}
              placeholder="Topics to emphasize, questions to ask the interviewer, or logistics..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {loading ? <span>Saving...</span> : <span>Save Schedule</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

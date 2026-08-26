'use client';

import React, { useState, useEffect } from 'react';
import { Interview, RoundType, InterviewStatus } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { X, Calendar, Clock, Video, UserCheck } from 'lucide-react';

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
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const mins = String(dt.getMinutes()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
        setTime(`${hours}:${mins}`);
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
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
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
      if (interviewToEdit && interviewToEdit.id) {
        result = await api.updateInterview(interviewToEdit.id, payload);
        success('Interview updated');
      } else {
        result = await api.scheduleInterview(payload);
        success('Interview scheduled');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save interview');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-[2px] animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-5 sm:p-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {interviewToEdit ? 'Edit Interview' : 'Schedule Interview'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Set date, time, and meeting details</p>
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
              <label className={labelClass}>Round Type</label>
              <select value={roundType} onChange={(e) => setRoundType(e.target.value as RoundType)} className={inputClass}>
                <option value="SCREENING">Screening</option>
                <option value="TECHNICAL">Technical</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="FINAL_ROUND">Final Round</option>
                <option value="HR">HR & Offer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Round #</label>
              <input type="number" min={1} max={10} value={roundNumber} onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date <span className="text-red-500">*</span></label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time <span className="text-red-500">*</span></label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duration</label>
              <select value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value))} className={inputClass}>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>90 min</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as InterviewStatus)} className={inputClass}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Meeting Link</label>
            <div className="relative">
              <Video className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="url" placeholder="https://meet.google.com/…" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className={`${inputClass} pl-9`} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Interviewer(s)</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="e.g. Sarah Connor (Staff Eng)" value={interviewerNames} onChange={(e) => setInterviewerNames(e.target.value)} className={`${inputClass} pl-9`} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea rows={3} placeholder="Prep topics, questions to ask…" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none leading-relaxed`} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

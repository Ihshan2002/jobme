'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Link as LinkIcon, Loader2, X } from 'lucide-react';
import { scheduleInterview } from '@/features/interviews/actions';
import { toast } from 'sonner';

interface Props {
  appId: string;
  seekerId: string;
  jobTitle: string;
  companyName: string;
  recruiterId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ScheduleInterviewForm({ appId, seekerId, jobTitle, companyName, recruiterId, onCancel, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return toast.error('Please select a date and time');

    setLoading(true);
    const res = await scheduleInterview(
      recruiterId,
      seekerId,
      appId,
      jobTitle,
      companyName,
      new Date(date).toISOString(),
      link
    );

    setLoading(false);

    if (res.success) {
      toast.success('Interview scheduled successfully!');
      onSuccess();
    } else {
      toast.error(res.error || 'Failed to schedule interview');
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-zinc-950/80 border-t border-blue-500/30 p-4 -mx-6 -mb-6 mt-6 rounded-b-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon size={12} /> Schedule Interview
        </h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm text-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Meeting Link (Optional)</label>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm text-sm p-2.5 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            Confirm Schedule
          </button>
        </div>
      </form>
    </div>
  );
}

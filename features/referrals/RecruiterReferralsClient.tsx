'use client';

import { useState } from 'react';
import { User, Briefcase, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { updateReferralStatus } from './recruiterActions';
import { toast } from 'sonner';

export function RecruiterReferralsClient({ referrals }: { referrals: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const res = await updateReferralStatus(id, status);
      if (res.success) {
        toast.success(`Application successfully ${status}!`);
      } else {
        toast.error(res.error || `Failed to update status.`);
      }
    } catch (e: any) {
      toast.error(e.message || "An unexpected error occurred.");
    } finally {
      setProcessing(null);
    }
  };

  if (!referrals || referrals.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 p-16 text-center rounded-xl shadow-sm">
        <FileText className="h-10 w-10 text-slate-200 dark:text-zinc-700 mx-auto mb-4" />
        <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">No pending referrals</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {referrals.map((ref) => {
        const seeker = ref.seeker;
        const jobTitle = ref.job_title;
        const note = ref.note;
        
        return (
          <div key={ref.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-blue-500/30 transition-colors">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                     <User size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">{seeker?.full_name || 'Candidate Name'}</h3>
                    <p className="text-[11px] text-slate-500">{seeker?.email || 'No email provided'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                  ref.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                  ref.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                  'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
                }`}>
                  {ref.status}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                   <Briefcase size={12} className="text-slate-400" />
                   <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-widest">{jobTitle || 'Unknown Role'}</p>
                </div>
              </div>

              {note && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-100 dark:border-zinc-800/80">
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic line-clamp-3 leading-relaxed">
                    "{note}"
                  </p>
                </div>
              )}
            </div>
            
            {ref.status === 'pending' && (
              <div className="border-t border-slate-100 dark:border-zinc-800 p-3 bg-slate-50/50 dark:bg-zinc-900/30 flex gap-2">
                <button 
                  onClick={() => handleAction(ref.id, 'rejected')}
                  disabled={processing === ref.id}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
                <button 
                  onClick={() => handleAction(ref.id, 'approved')}
                  disabled={processing === ref.id}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded text-[11px] font-bold uppercase tracking-widest text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={14} /> Approve
                </button>
              </div>
            )}
            {ref.status !== 'pending' && (
              <div className="border-t border-slate-100 dark:border-zinc-800 p-3 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-center items-center gap-1.5">
                 <Clock size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   Reviewed on {new Date(ref.updated_at || Date.now()).toLocaleDateString()}
                 </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

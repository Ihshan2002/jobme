'use client';

import { useState } from 'react';
import { Share2, User, Briefcase, MapPin, Send } from 'lucide-react';
import { forwardApplication } from './adminActions';
import { toast } from 'sonner';

export function AdminReferralsClient({ applications, companies, adminId }: { applications: any[], companies: any[], adminId: string }) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForward = async () => {
    if (!selectedApp || !selectedCompany) return;
    setIsSubmitting(true);
    try {
      const res = await forwardApplication(selectedApp, selectedCompany, adminId);
      if (res.success) {
        toast.success("Application successfully forwarded!");
        setSelectedApp(null);
      } else {
        toast.error(res.error || "Failed to forward application.");
      }
    } catch (e: any) {
      toast.error(e.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
      <div className="p-1 bg-slate-50/50 dark:bg-zinc-800/20 border-b border-slate-200 dark:border-zinc-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800">Seeker</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800">Target Job</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800">Status & Referrals</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="group border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                      <User size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{app.seeker?.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-500">{app.seeker?.email || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{app.jobs?.title || 'Unknown Job'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                     <Briefcase size={10} className="text-slate-400" />
                     <span className="text-[10px] text-slate-500">{app.jobs?.company_name}</span>
                     <MapPin size={10} className="text-slate-400 ml-2" />
                     <span className="text-[10px] text-slate-500">{app.jobs?.location}</span>
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/50 mb-2">
                    {app.status}
                  </span>
                  {app.referrals && app.referrals.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {app.referrals.map((ref: any) => (
                        <div key={ref.id} className="flex items-center gap-1 text-[10px]">
                           <Share2 size={10} className="text-slate-400" />
                           <span className="font-medium text-slate-600 dark:text-zinc-400">{ref.companies?.name || 'Company'}</span>
                           <span className={`ml-1 px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
                             ref.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                             ref.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                             'bg-slate-100 text-slate-700'
                           }`}>
                             {ref.status}
                           </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 align-top text-right">
                  {selectedApp === app.id ? (
                    <div className="flex flex-col items-end gap-2">
                      <select 
                        className="text-xs border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-1"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                      >
                        <option value="">Select Company...</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedApp(null)}
                          className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleForward}
                          disabled={isSubmitting || !selectedCompany}
                          className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectedApp(app.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <Send size={12} /> Forward
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

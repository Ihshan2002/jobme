// app/dashboard/jobs/page.tsx

import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminJobsTable } from '@/features/jobs/AdminJobsTable';
import { Briefcase, Layers, Plus, Search } from 'lucide-react';

// ── Logic: Untouched ──────────────────────────────────────────────
async function getJobs() {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select(`
      id, title, company_name, location, job_type,
      status, created_at, skills,
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ── UI: Enterprise Overhaul ───────────────────────────────────────
export default async function AdminJobsPage() {
  const jobs = await getJobs();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Contextual Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <nav className="flex text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
          <span className="hover:text-blue-600 cursor-pointer">System</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900 dark:text-white">Job Registry</span>
        </nav>
      </div>

      <div className="p-6 lg:p-10 flex-1">
        {/* Enterprise Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-slate-900 dark:bg-blue-500">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Post Management
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
              Job Listings
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Review, moderate, and manage the lifecycle of all platform career opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button className="h-10 px-4 text-xs font-bold border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 transition-all uppercase tracking-tight">
               Archive All
             </button>
             <button className="h-10 px-4 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 uppercase tracking-tight">
               <Plus className="h-4 w-4" />
               Manual Entry
             </button>
          </div>
        </div>

        {/* Global Registry Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title, company, or ID..." 
              className="w-full h-10 pl-10 pr-4 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 md:col-start-4 justify-end">
            <div className="h-10 px-3 flex items-center gap-2 border border-slate-200 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-900 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
               Total: {jobs?.length || 0} Records
            </div>
          </div>
        </div>

        {/* Data Container */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-1 bg-slate-50/50 dark:bg-zinc-800/20 border-b border-slate-200 dark:border-zinc-800">
             {/* This wrapper ensures the table feels like a modular part of the "Suite" */}
             <AdminJobsTable jobs={jobs} />
          </div>
        </div>
      </div>
    </div>
  );
}
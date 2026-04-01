// app/dashboard/jobs/page.tsx

import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminJobsTable } from '@/features/jobs/AdminJobsTable';
import { Briefcase } from 'lucide-react';

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

export default async function AdminJobsPage() {
  const jobs = await getJobs();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40">
          <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Job Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Approve or reject job postings
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-zinc-800" />

      <AdminJobsTable jobs={jobs} />
    </div>
  );
}
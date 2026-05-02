'use client';

// app/seeker/jobs/page.tsx
import { useMemo, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, Search, MapPin,
  Briefcase, Clock, DollarSign, BookmarkPlus, BookmarkCheck,
  Filter, Layers
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[];
  created_at: string;
}

const JOB_TYPES = ['all', 'full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function SeekerJobsPage() {
  const router = useRouter();
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [filtered, setFiltered]   = useState<Job[]>([]);
  const [savedIds, setSavedIds]   = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userId, setUserId]       = useState('');

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, job_type, salary_min, salary_max, skills, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      const { data: savedData } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('seeker_id', user.id);

      setJobs(jobsData ?? []);
      setFiltered(jobsData ?? []);
      setSavedIds(savedData?.map((s) => s.job_id) ?? []);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  useEffect(() => {
    let result = jobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((j) => j.job_type === typeFilter);
    }
    setFiltered(result);
  }, [search, typeFilter, jobs]);

  async function toggleSave(jobId: string) {
    const isSaved = savedIds.includes(jobId);
    if (isSaved) {
      await supabase.from('saved_jobs').delete()
        .eq('seeker_id', userId).eq('job_id', jobId);
      setSavedIds(savedIds.filter((id) => id !== jobId));
    } else {
      await supabase.from('saved_jobs').insert({ seeker_id: userId, job_id: jobId });
      setSavedIds([...savedIds, jobId]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950">
        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 pb-20">
      
      {/* Slim Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-14 flex items-center">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <button
            onClick={() => router.push('/seeker/dashboard')}
            className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">
              Global <span className="text-blue-600">Registry</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Search & Filter Control Center */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-1.5 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search job titles, companies, or tech stack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-transparent focus:border-blue-500/50 dark:focus:border-blue-500/30 rounded text-[13px] outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1">
              <Filter size={14} className="text-slate-400 mx-1 shrink-0" />
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-tight whitespace-nowrap transition-all
                    ${typeFilter === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Available Opportunities</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
            Count: {filtered.length}
          </span>
        </div>

        {/* Jobs Grid/List */}
        {filtered.length === 0 ? (
          <div className="border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl py-20 text-center">
            <Briefcase className="h-10 w-10 text-slate-200 dark:text-zinc-800 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((job) => {
              const isSaved = savedIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-md hover:border-blue-500/50 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[9px] font-black uppercase rounded tracking-widest border border-slate-200 dark:border-zinc-700">
                        {job.job_type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500">
                        <Briefcase size={13} strokeWidth={2.5} />
                        <span className="text-[12px] font-semibold">{job.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500">
                        <MapPin size={13} />
                        <span className="text-[12px] font-medium">{job.location}</span>
                      </div>
                      {(job.salary_min || job.salary_max) && (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                          <DollarSign size={13} />
                          <span className="text-[12px] font-bold tabular-nums">
                            {job.salary_min && job.salary_max
                              ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                              : job.salary_min?.toLocaleString() ?? job.salary_max?.toLocaleString()
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-600">
                        <Clock size={13} />
                        <span className="text-[11px] font-medium tracking-tight">
                          {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600/80 dark:text-blue-400/80 text-[10px] font-bold uppercase rounded border border-blue-100/50 dark:border-blue-900/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-bold ml-1">+{job.skills.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:pl-4 md:border-l border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`h-9 w-9 flex items-center justify-center rounded border transition-all ${
                        isSaved
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600'
                          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                    </button>
                    <Link
                      href={`/seeker/jobs/${job.id}`}
                      className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-500/10 transition-all active:scale-95 flex items-center justify-center"
                    >
                      Process
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
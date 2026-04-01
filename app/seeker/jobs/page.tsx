'use client';

// app/seeker/jobs/page.tsx
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, Search, MapPin,
  Briefcase, Clock, DollarSign, BookmarkPlus, BookmarkCheck,
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

      // Fetch approved jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, job_type, salary_min, salary_max, skills, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Fetch saved job ids
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
  }, []);

  // Filter jobs
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-slate-400 text-sm">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/seeker/dashboard"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              Job<span className="text-blue-600">Me</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Browse Jobs
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {filtered.length} job{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search + Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors
                  ${typeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-blue-300'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center">
            <Briefcase className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="font-medium text-slate-900 dark:text-white">No jobs found</p>
            <p className="text-sm text-slate-400 mt-1">Try different search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => {
              const isSaved = savedIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {job.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs rounded-md capitalize border border-blue-100 dark:border-blue-900">
                          {job.job_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 flex-wrap mt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.company_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        {(job.salary_min || job.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salary_min && job.salary_max
                              ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                              : job.salary_min?.toLocaleString() ?? job.salary_max?.toLocaleString()
                            }
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => toggleSave(job.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        }`}
                      >
                        {isSaved
                          ? <BookmarkCheck className="h-4 w-4" />
                          : <BookmarkPlus  className="h-4 w-4" />
                        }
                      </button>
                      <Link
                        href={`/seeker/jobs/${job.id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Apply
                      </Link>
                    </div>
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
'use client';

// app/seeker/jobs/[id]/page.tsx
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, MapPin, Briefcase,
  Clock, DollarSign, Tag, CheckCircle, BookmarkPlus, BookmarkCheck,
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
  description: string;
  created_at: string;
}

export default function JobDetailPage() {
  const router   = useRouter();
  const { id }   = useParams();
  const [job, setJob]             = useState<Job | null>(null);
  const [loading, setLoading]     = useState(true);
  const [applying, setApplying]   = useState(false);
  const [applied, setApplied]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [userId, setUserId]       = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState('');

  const supabase = useMemo(() => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      // Fetch job
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (!jobData) { router.push('/seeker/jobs'); return; }
      setJob(jobData);

      // Check if already applied
      const { data: appData } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('seeker_id', user.id)
        .single();
      setApplied(!!appData);

      // Check if saved
      const { data: savedData } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('job_id', id)
        .eq('seeker_id', user.id)
        .single();
      setSaved(!!savedData);

      setLoading(false);
    }
    load();
  }, [id]);

  async function handleApply() {
    if (!coverLetter.trim()) {
      setError('Please write a cover letter.');
      return;
    }
    setError('');
    setApplying(true);

    const { error: applyError } = await supabase.from('applications').insert({
      job_id:       id,
      seeker_id:    userId,
      cover_letter: coverLetter,
      status:       'applied',
    });

    if (applyError) {
      setError(applyError.message);
      setApplying(false);
      return;
    }

    setApplied(true);
    setShowForm(false);
    setApplying(false);
  }

  async function toggleSave() {
    if (saved) {
      await supabase.from('saved_jobs').delete()
        .eq('seeker_id', userId).eq('job_id', id);
      setSaved(false);
    } else {
      await supabase.from('saved_jobs').insert({ seeker_id: userId, job_id: id });
      setSaved(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/seeker/jobs"
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

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Job Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.company_name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Clock className="h-3.5 w-3.5" />
                  {job.job_type}
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
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={toggleSave}
              className={`p-2.5 rounded-xl transition-colors ${
                saved
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              {saved ? <BookmarkCheck className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
            </button>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">
                <Tag className="h-3.5 w-3.5" /> Required Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs rounded-lg border border-blue-100 dark:border-blue-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Job Description</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Apply Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
          {applied ? (
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Application Submitted!</p>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                  Track your application in{' '}
                  <Link href="/seeker/applications" className="text-blue-600 hover:underline">
                    My Applications
                  </Link>
                </p>
              </div>
            </div>
          ) : showForm ? (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-900 dark:text-white">Apply for this Job</h2>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                  Cover Letter *
                </label>
                <textarea
                  placeholder="Tell the employer why you're a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Interested in this role?
                </p>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                  Apply now and stand out!
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
'use client';

// app/recruiter/jobs/new/page.tsx

import { useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Tag,
  Plus,
  X,
} from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function PostJobPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle]           = useState('');
  const [company, setCompany]       = useState('');
  const [location, setLocation]     = useState('');
  const [jobType, setJobType]       = useState('full-time');
  const [salaryMin, setSalaryMin]   = useState('');
  const [salaryMax, setSalaryMax]   = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills]         = useState<string[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function handlePost() {
    if (!title || !company || !location || !description) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { error: insertError } = await supabase.from('jobs').insert({
        recruiter_id: user.id,
        title,
        company_name: company,
        location,
        job_type: jobType,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        description,
        skills,
        status: 'pending', // Admin approval needed
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push('/recruiter/jobs');
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/recruiter/dashboard"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
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

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Post a New Job
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Fill in the details below. Your job will be reviewed by admin before going live.
          </p>
        </div>

        <div className="space-y-5">

          {/* Title + Company */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" /> Job Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                  Job Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Location + Type + Salary */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" /> Location & Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 block">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all capitalize"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Salary Range (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                />
                <span className="text-slate-400 text-sm shrink-0">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" /> Required Skills
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React, TypeScript"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="h-3 w-3 hover:text-blue-900" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Job Description *
            </h2>
            <textarea
              placeholder="Describe the role, responsibilities, requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Link
              href="/recruiter/dashboard"
              className="flex-1 py-2.5 text-center border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handlePost}
              disabled={isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {isPending ? 'Posting...' : 'Post Job'}
            </button>
          </div>

          <p className="text-xs text-center text-slate-400 dark:text-zinc-500">
            ⏳ Your job will be reviewed by admin before going live.
          </p>
        </div>
      </main>
    </div>
  );
}
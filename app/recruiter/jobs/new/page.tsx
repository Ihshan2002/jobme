'use client';

// app/recruiter/jobs/new/page.tsx

import { useState, useTransition, useMemo } from 'react';
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
  FileText,
  Zap,
  Lock
} from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function PostJobPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle]             = useState('');
  const [company, setCompany]         = useState('');
  const [location, setLocation]       = useState('');
  const [jobType, setJobType]         = useState('full-time');
  const [salaryMin, setSalaryMin]     = useState('');
  const [salaryMax, setSalaryMax]     = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput]   = useState('');
  const [skills, setSkills]           = useState<string[]>([]);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

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
      setError('REQUIRED_FIELDS_MISSING: Please complete all marked sections.');
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
        status: 'pending', 
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push('/recruiter/jobs');
    });
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/recruiter/jobs"
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Abort Entry
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-900 dark:bg-blue-600 rounded-sm">
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-black text-sm tracking-tighter uppercase">
                Job<span className="text-blue-600">Me</span> <span className="text-slate-400 font-medium">Registry</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12 space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">New Deployment</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Post New Position
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Authorization: <span className="text-blue-600">Admin Verification Required</span>
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 01: Core Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500">01</span>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Position Identity</h2>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-sm shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-tight text-slate-500">Job Title *</label>
                  <input
                    type="text"
                    placeholder="E.G. SYSTEMS ENGINEER"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-tight text-slate-500">Company Entity *</label>
                  <input
                    type="text"
                    placeholder="ENTITY NAME"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 02: Logistics */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500">02</span>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Logistics & Compensation</h2>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-sm shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-tight text-slate-500">Geographic Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="CITY, COUNTRY"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm pl-10 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-tight text-slate-500">Contract Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm px-4 py-3 text-sm font-bold uppercase tracking-tighter outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-tight text-slate-500">Annual Salary Range (USD)</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="number"
                      placeholder="MIN"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm pl-10 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                  <div className="h-[1px] w-4 bg-slate-300" />
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="number"
                      placeholder="MAX"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm pl-10 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Skills */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500">03</span>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Technical Requirements</h2>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-sm shadow-sm space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="ENTER SKILL TAG..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm pl-10 pr-4 py-3 text-sm font-bold uppercase placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
                <button
                  onClick={addSkill}
                  className="px-6 bg-slate-900 dark:bg-blue-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
                >
                  Append
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 dark:bg-zinc-950 rounded-sm border border-dashed border-slate-200 dark:border-zinc-800">
                {skills.length === 0 && <span className="text-[10px] font-bold text-slate-300 uppercase p-1">No skills defined</span>}
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-tighter rounded-sm"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-rose-500 hover:text-rose-700 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Section 04: Description */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500">04</span>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Position Narrative</h2>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-sm shadow-sm">
              <textarea
                placeholder="DETAILED ROLE SPECIFICATIONS..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-sm px-4 py-3 text-sm font-medium leading-relaxed outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
              />
            </div>
          </section>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 flex items-center gap-3">
              <X className="text-rose-500" size={16} />
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* Submission Controls */}
          <div className="pt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handlePost}
              disabled={isPending}
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-sm text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isPending ? 'Processing Transmission...' : 'Execute Deployment'}
              {!isPending && <Zap size={14} fill="currentColor" />}
            </button>
            <Link
              href="/recruiter/jobs"
              className="flex-1 h-14 flex items-center justify-center border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-sm text-xs font-black uppercase tracking-[0.2em] transition-all"
            >
              Abort Entry
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 py-4">
            <Lock size={12} className="text-slate-300" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
              All submissions are subject to manual review by JobMe security protocols.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
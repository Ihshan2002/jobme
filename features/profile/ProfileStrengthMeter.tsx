'use client';

import { CheckCircle2, CircleDashed, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

export interface ProfileData {
  full_name?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  experience?: string | null;
  education?: string | null;
  resume_url?: string | null;
}

export function ProfileStrengthMeter({ profile }: { profile: ProfileData }) {
  const points = [
    { key: 'full_name', label: 'Full Name', value: 20, done: !!profile.full_name },
    { key: 'bio', label: 'Professional Bio', value: 15, done: !!profile.bio },
    { key: 'skills', label: 'Skills (Min 3)', value: 20, done: !!(profile.skills && profile.skills.length >= 3) },
    { key: 'experience', label: 'Work Experience', value: 15, done: !!profile.experience },
    { key: 'education', label: 'Education', value: 15, done: !!profile.education },
    { key: 'resume_url', label: 'Resume / CV Uploaded', value: 15, done: !!profile.resume_url },
  ];

  const totalScore = points.reduce((acc, curr) => curr.done ? acc + curr.value : acc, 0);

  let level = 'Beginner';
  let levelColor = 'text-slate-500';
  let barColor = 'stroke-slate-500';

  if (totalScore > 20) { level = 'Getting Started'; levelColor = 'text-blue-500'; barColor = 'stroke-blue-500'; }
  if (totalScore > 40) { level = 'Intermediate'; levelColor = 'text-indigo-500'; barColor = 'stroke-indigo-500'; }
  if (totalScore > 60) { level = 'Strong'; levelColor = 'text-purple-500'; barColor = 'stroke-purple-500'; }
  if (totalScore > 80) { level = 'All Star ⭐'; levelColor = 'text-amber-500'; barColor = 'stroke-amber-500'; }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group hover:border-blue-500/30 transition-colors">
      
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Circular Progress */}
      <div className="relative shrink-0 flex items-center justify-center mt-2 md:mt-0">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-100 dark:stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            className={`${barColor} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            {totalScore}<span className="text-lg text-slate-400">%</span>
          </span>
        </div>
      </div>

      {/* Content & Checklist */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className={levelColor} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${levelColor}`}>
                {level} Level
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Profile Strength
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {totalScore === 100 
                ? "Incredible! Your profile is fully optimized for top recruiters." 
                : "Complete your profile to stand out to top recruiters and companies."}
            </p>
          </div>
          <Link 
            href="/seeker/profile"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
          >
            Edit Profile <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mt-6">
          {points.map((pt) => (
            <div key={pt.key} className="flex items-center gap-2">
              {pt.done ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <CircleDashed size={16} className="text-slate-300 dark:text-zinc-700 shrink-0" />
              )}
              <span className={`text-xs font-bold tracking-tight ${pt.done ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-400 dark:text-zinc-500'}`}>
                {pt.label} <span className="text-[10px] text-slate-400 dark:text-zinc-600 font-normal ml-1">+{pt.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

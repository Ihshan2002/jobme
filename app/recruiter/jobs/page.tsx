"use client";

// app/recruiter/jobs/page.tsx

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  PlusCircle,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  skills: string[];
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const map = {
    pending: {
      icon: AlertCircle,
      label: "Pending",
      class:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    approved: {
      icon: CheckCircle,
      label: "Approved",
      class:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      class:
        "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    },
  };
  const { icon: Icon, label, class: cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

const supabase = useMemo(() => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
), []);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("jobs")
        .select(
          "id, title, company_name, location, job_type, status, created_at, skills",
        )
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      setJobs(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(jobId: string) {
    if (!confirm("Delete this job?")) return;
    await supabase.from("jobs").delete().eq("id", jobId);
    setJobs(jobs.filter((j) => j.id !== jobId));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/recruiter/dashboard"
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
          <Link
            href="/recruiter/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Post Job
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Jobs
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center">
            <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-xl w-fit mx-auto mb-4">
              <Briefcase className="h-6 w-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="font-medium text-slate-900 dark:text-white">
              No jobs posted yet
            </p>
            <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">
              Post your first job to start receiving applications
            </p>
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {job.title}
                      </h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 flex-wrap">
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
                        {job.skills.length > 5 && (
                          <span className="px-2 py-0.5 text-slate-400 text-xs">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs text-slate-400 dark:text-zinc-500 hidden sm:block">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      Applicants
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

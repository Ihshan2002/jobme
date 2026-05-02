'use client';

// app/recruiter/jobs/[id]/ApplicantActions.tsx

import { useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Star, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  appId: string;
  status: string;
}

export function ApplicantActions({ appId, status: initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const router = useRouter();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  async function updateStatus(newStatus: string) {
    await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', appId);
    setStatus(newStatus);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => updateStatus('shortlisted')}
        disabled={status === 'shortlisted'}
        title="Shortlist"
        className={`p-2 rounded-lg transition-colors ${
          status === 'shortlisted'
            ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30'
            : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950/30'
        }`}
      >
        <Star className="h-4 w-4" />
      </button>
      <button
        onClick={() => updateStatus('accepted')}
        disabled={status === 'accepted'}
        title="Accept"
        className={`p-2 rounded-lg transition-colors ${
          status === 'accepted'
            ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
            : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-950/30'
        }`}
      >
        <CheckCircle className="h-4 w-4" />
      </button>
      <button
        onClick={() => updateStatus('rejected')}
        disabled={status === 'rejected'}
        title="Reject"
        className={`p-2 rounded-lg transition-colors ${
          status === 'rejected'
            ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
            : 'text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30'
        }`}
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}
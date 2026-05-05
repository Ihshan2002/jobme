import { getRecruiterReferrals } from '@/features/referrals/recruiterActions';
import { RecruiterReferralsClient } from '@/features/referrals/RecruiterReferralsClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { FileText } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function RecruiterReferralsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const referrals = await getRecruiterReferrals(user.id);

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-16 flex items-center">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
              <FileText size={16} />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">
              Candidate <span className="text-blue-600">Referrals</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
            Action Required
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
            Review the candidates forwarded to you by the platform administrators.
          </p>
        </div>

        <RecruiterReferralsClient referrals={referrals} />
      </main>
    </div>
  );
}

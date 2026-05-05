import { getProfile } from '@/features/profile/actions';
import { ProfileFormClient } from '@/features/profile/ProfileFormClient';
import { User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function SeekerProfilePage() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-14 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
          <Link
            href="/seeker/dashboard"
            className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">
              My <span className="text-blue-600">Profile</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Profile Details
          </h1>
          <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
            Build your strength meter to 100% by filling out all fields
          </p>
        </div>

        <ProfileFormClient initialProfile={profile} />
      </main>
    </div>
  );
}

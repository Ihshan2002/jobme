import { getApplicationsForAdmin, getCompanies } from '@/features/referrals/adminActions';
import { AdminReferralsClient } from '@/features/referrals/AdminReferralsClient';
import { Network, Search } from 'lucide-react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminReferralsPage() {
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

  const applications = await getApplicationsForAdmin();
  const companies = await getCompanies();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Contextual Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <nav className="flex text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
          <span className="hover:text-blue-600 cursor-pointer">System</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900 dark:text-white">Referrals</span>
        </nav>
      </div>

      <div className="p-6 lg:p-10 flex-1">
        {/* Enterprise Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-slate-900 dark:bg-blue-500">
                <Network className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Application Routing
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
              Referral Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Review applicant CVs and securely forward them to partner companies.
            </p>
          </div>
        </div>

        {/* Global Registry Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="w-full h-10 pl-10 pr-4 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 md:col-start-4 justify-end">
            <div className="h-10 px-3 flex items-center gap-2 border border-slate-200 dark:border-zinc-800 rounded bg-slate-50 dark:bg-zinc-900 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
               Total: {applications?.length || 0} Records
            </div>
          </div>
        </div>

        {/* Data Container */}
        <AdminReferralsClient applications={applications} companies={companies} adminId={user.id} />
      </div>
    </div>
  );
}

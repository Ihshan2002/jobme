// app/dashboard/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  Users,
  Briefcase,
  FileText,
  Shield,
  Zap,
  ArrowUpRight,
  Activity,
  LayoutDashboard
} from 'lucide-react';

// ── Data Fetching ──────────────────────────────────────────────
async function getStats() {
  const [
    { count: totalUsers },
    { count: totalAdmins },
    { count: totalRecruiters },
    { count: totalSeekers },
    { count: bannedUsers },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin').is('deleted_at', null),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'recruiter').is('deleted_at', null),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seeker').is('deleted_at', null),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).not('banned_until', 'is', null),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalAdmins: totalAdmins ?? 0,
    totalRecruiters: totalRecruiters ?? 0,
    totalSeekers: totalSeekers ?? 0,
    bannedUsers: bannedUsers ?? 0,
  };
}

// ── Component: Stat Card ──────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: number; icon: any; color: string; sub: string }) {
  return (
    <div className="group relative rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/30">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${color}`}>
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Live Update</span>
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-1">{label}</p>
        <h3 className="text-3xl font-bold tracking-tight text-white">{value.toLocaleString()}</h3>
        <p className="text-[10px] text-zinc-600 mt-2 font-semibold uppercase tracking-tighter">{sub}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 p-6 lg:p-12 selection:bg-white/10">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-900 pb-8">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <LayoutDashboard size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Administrative Suite</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">System Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time performance metrics and user distribution.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-bold text-emerald-500 uppercase">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Database Connected
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
        <StatCard label="Total Platform Users" value={stats.totalUsers} icon={Users} color="text-white" sub="Verified Accounts" />
        <StatCard label="Active Recruiters" value={stats.totalRecruiters} icon={Briefcase} color="text-blue-400" sub="Hiring Now" />
        <StatCard label="Verified Seekers" value={stats.totalSeekers} icon={FileText} color="text-emerald-400" sub="Active Candidates" />
        <StatCard label="System Admins" value={stats.totalAdmins} icon={Shield} color="text-purple-400" sub="Core Operators" />
        <StatCard label="Security Alerts" value={stats.bannedUsers} icon={Zap} color="text-amber-400" sub="Restricted Access" />
      </div>

      {/* Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-2xl border border-zinc-900 bg-zinc-950/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-600">Administrative Actions</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/dashboard/users" className="group flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-white/[0.03] hover:border-zinc-600 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 text-zinc-400 group-hover:text-white transition-colors">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">User Management</p>
                  <p className="text-xs text-zinc-500 uppercase font-medium">Verify or restrict operatives</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* System Activity */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/20 p-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 flex items-center gap-2">
            <Activity size={12} /> Recent Activity
          </h4>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative pl-4 border-l border-zinc-800">
                <div className="absolute -left-[4.5px] top-0 h-2 w-2 rounded-full bg-zinc-800" />
                <p className="text-[10px] font-bold text-zinc-700 uppercase">12:0{i} PM</p>
                <p className="text-xs text-zinc-400 mt-1 font-medium">New recruiter profile verified by Admin.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
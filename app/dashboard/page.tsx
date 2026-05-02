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
  LayoutDashboard,
  TrendingUp,
  Globe,
  Terminal,
  Server,
  Database
} from 'lucide-react';

// ── Data Fetching (Logic preserved 100%) ──────────────────────────────────────
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

// ── Component: Stat Card (Registry Style) ──────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: number; icon: any; color: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 ${color}`}>
          <Icon size={18} />
        </div>
        <TrendingUp size={14} className="text-slate-300 dark:text-zinc-600" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.15em]">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
            {value.toLocaleString()}
          </h3>
        </div>
        <div className="mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-50 dark:border-zinc-800/50">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider">{sub}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page (Registry Layout) ──────────────────────────────────────────────
export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-12">
      
      {/* Top Utility Bar */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 h-12 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Globe size={12} className="text-blue-500" /> Region: Cluster-Alpha-01
          </span>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800" />
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Database size={12} className="text-amber-500" /> Latency: 24ms
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Core Operational</span>
        </div>
      </div>

      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2 font-black text-[10px] uppercase tracking-[0.3em]">
              <Server size={14} /> Platform Controller
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Operational Analytics
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 mt-1 text-[13px] font-medium max-w-xl leading-relaxed">
              Real-time synchronization of the JobMe ecosystem. Monitoring user distribution and security compliance across all segments.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tabular-nums bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded">
            L-SYNC: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC
          </div>
        </header>

        {/* Stats Grid - High Density */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatCard label="Consolidated Users" value={stats.totalUsers} icon={Users} color="text-slate-900 dark:text-zinc-300" sub="Registry Total" />
          <StatCard label="Recruiter Nodes" value={stats.totalRecruiters} icon={Briefcase} color="text-blue-600" sub="Hiring Authority" />
          <StatCard label="Talent Indices" value={stats.totalSeekers} icon={FileText} color="text-emerald-600" sub="Verified Seekers" />
          <StatCard label="Admin Overlook" value={stats.totalAdmins} icon={Shield} color="text-indigo-600" sub="Root Access" />
          <StatCard label="Security Flags" value={stats.bannedUsers} icon={Zap} color="text-rose-600" sub="Banned Entries" />
        </div>

        {/* Management & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick Actions Panel */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-[#fcfcfd] dark:bg-zinc-900/50 flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Control Interface</h4>
              <Terminal size={14} className="text-slate-300" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { href: "/dashboard/users", icon: Users, title: "Identity Registry", desc: "Manage authentication & roles", color: "text-blue-600" },
                  { href: "/dashboard/jobs", icon: Briefcase, title: "Job Index", desc: "Audit active listing status", color: "text-emerald-600" },
                ].map((action, idx) => (
                  <a key={idx} href={action.href} className="group p-5 rounded border border-slate-100 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded bg-slate-50 dark:bg-zinc-800 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <action.icon size={18} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{action.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-tighter mt-0.5">{action.desc}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-[#fcfcfd] dark:bg-zinc-900/50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <Activity size={14} className="text-blue-500" /> Live System Logs
              </h4>
            </div>
            <div className="p-6 space-y-5 max-h-[300px] overflow-y-auto font-mono">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-zinc-800 group-first:bg-blue-500 group-first:animate-pulse" />
                    <div className="w-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <div className="pb-4">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 tabular-nums bg-slate-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded">
                      [T-0{i}] 14:22:0{i}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2 font-bold leading-tight uppercase tracking-tight">
                      AUTH_PROC: Recruiter <span className="text-blue-600 dark:text-blue-400">ID_990{i}</span> status: verified.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
// app/dashboard/users/page.tsx

import { Suspense } from 'react';
import { Users, UserPlus, FileDown, Filter } from 'lucide-react';
import { getAdminUsers } from '@/features/users/service';
import { UserTable } from '@/features/users/UserTable';

async function UsersContent() {
  const users = await getAdminUsers();
  return <UserTable users={users} />;
}

// More sophisticated skeleton with "shimmer" effect and structural consistency
function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-9 w-72 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
        <div className="h-9 w-24 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
      </div>
      <div className="border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden">
        <div className="h-10 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-4 py-3 border-b border-slate-100 dark:border-zinc-800/50 last:border-0">
            <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Subtle Breadcrumb Header */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <nav className="flex text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">User Management</span>
        </nav>
      </div>

      <div className="p-6 lg:p-8 flex-1">
        {/* Enterprise Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-slate-700 dark:text-zinc-300" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Directory
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
              Audit and manage system access for recruiters, candidates, and internal stakeholders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {/* Global Table Controls */}
        <div className="mb-4 flex items-center justify-between">
           <div className="relative flex-1 max-w-md">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input 
              type="text" 
              placeholder="Filter by name, email or role..." 
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             />
           </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-lg">
          <Suspense fallback={<TableSkeleton />}>
            <UsersContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
// app/dashboard/users/page.tsx

import { Suspense } from 'react';
import { Users }    from 'lucide-react';
import { getAdminUsers } from '@/features/users/service';
import { UserTable }     from '@/features/users/UserTable';

async function UsersContent() {
  const users = await getAdminUsers();
  return <UserTable users={users} />;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-64 rounded-lg bg-slate-200 dark:bg-zinc-800 animate-pulse" />
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-6 py-4 border-b border-slate-100 dark:border-zinc-800/50 last:border-0">
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-48 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Manage recruiters and job seekers
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-zinc-800" />

      {/* Table */}
      <Suspense fallback={<TableSkeleton />}>
        <UsersContent />
      </Suspense>
    </div>
  );
}
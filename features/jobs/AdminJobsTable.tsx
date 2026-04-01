'use client';

// features/jobs/AdminJobsTable.tsx

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input }  from '@/components/ui/input';
import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { MoreHorizontal, Search, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { updateJobStatus, deleteJob } from './actions';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  skills: string[];
  profiles: { full_name: string | null; email: string }[] | null;
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const map = {
    pending:  'bg-amber-500/10 text-amber-600 border-amber-200',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    rejected: 'bg-red-500/10 text-red-600 border-red-200',
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function JobRowActions({ job }: { job: Job }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function run(fn: () => Promise<{ success: boolean; error?: string }>, msg: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.success) { toast.success(msg); router.refresh(); }
      else             { toast.error(res.error ?? 'Something went wrong'); }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => run(() => updateJobStatus(job.id, 'approved'), 'Job approved!')}
            disabled={job.status === 'approved'}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => run(() => updateJobStatus(job.id, 'rejected'), 'Job rejected')}
            disabled={job.status === 'rejected'}
          >
            <XCircle className="mr-2 h-4 w-4 text-amber-500" />
            Reject
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently removes <strong>{job.title}</strong> and all its applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
              onClick={() => run(() => deleteJob(job.id), 'Job deleted')}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AdminJobsTable({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.status.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Posted By</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-muted-foreground">{job.company_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {job.profiles?.[0]?.full_name || job.profiles?.[0]?.email || '—'}
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {job.job_type}
                  </TableCell>
                  <TableCell><StatusBadge status={job.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell><JobRowActions job={job} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {jobs.length} jobs
      </p>
    </div>
  );
}
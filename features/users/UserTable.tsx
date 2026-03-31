'use client';

// features/users/UserTable.tsx

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input }   from '@/components/ui/input';
import { Badge }   from '@/components/ui/badge';
import { Button }  from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { MoreHorizontal, Search, Shield, Trash2, Ban, CheckCircle, UserPlus} from 'lucide-react';
import { updateUserRole, deleteUserAccount, toggleUserBan } from './actions';
import type { AdminUser, UserRole } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createUser } from './actions';

// ── Badges ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AdminUser['status'] }) {
  const map = {
    active:  'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    banned:  'bg-amber-500/10  text-amber-600  border-amber-200',
    deleted: 'bg-red-500/10    text-red-600    border-red-200',
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const map = {
    admin:     'bg-purple-500/10 text-purple-600 border-purple-200',
    recruiter: 'bg-blue-500/10   text-blue-600   border-blue-200',
    seeker:    'bg-slate-500/10  text-slate-600  border-slate-200',
  };
  return (
    <Badge variant="outline" className={map[role]}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

function AddUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('seeker');
  const [error, setError] = useState('');

  function handleCreate() {
    if (!email || !password) { setError('Email and password required.'); return; }
    setError('');
    startTransition(async () => {
      const res = await createUser(email, password, fullName, role);
      if (res.success) {
        toast.success('User created!');
        setOpen(false);
        setFullName(''); setEmail(''); setPassword(''); setRole('seeker');
        router.refresh();
      } else {
        setError(res.error ?? 'Failed.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex gap-2">
            {(['seeker', 'recruiter', 'admin'] as UserRole[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-md border capitalize transition-colors
                  ${role === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-input hover:border-primary'}`}>
                {r}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button className="w-full" onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Row Actions ───────────────────────────────────────────────
function RowActions({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isBanned  = user.status === 'banned';
  const isDeleted = user.status === 'deleted';

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
          <Button variant="ghost" size="icon" disabled={isPending || isDeleted}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
          {(['admin', 'recruiter', 'seeker'] as UserRole[])
            .filter((r) => r !== user.role)
            .map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => run(() => updateUserRole(user.id, role), `Role → ${role}`)}
              >
                <Shield className="mr-2 h-4 w-4" />
                Set as {role}
              </DropdownMenuItem>
            ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => run(() => toggleUserBan(user.id, isBanned), isBanned ? 'User unbanned' : 'User banned')}
          >
            {isBanned
              ? <><CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />Unban</>
              : <><Ban         className="mr-2 h-4 w-4 text-amber-500"  />Ban</>}
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
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{user.full_name ?? user.email}</strong> from
              the database and authentication system. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
              onClick={() => run(() => deleteUserAccount(user.id), 'User deleted')}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Main Table ────────────────────────────────────────────────
export function UserTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      {/* Search + Add User */}
<div className="flex items-center gap-3">
  <div className="relative max-w-sm flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search name, email, role…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pl-9"
    />
  </div>
  <AddUserDialog />
</div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} className={user.status === 'deleted' ? 'opacity-40' : ''}>
                  <TableCell className="font-medium">{user.full_name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell><RowActions user={user} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {users.length} users
      </p>
    </div>
  );
}
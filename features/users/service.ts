// features/users/service.ts
// Data fetching — called from Server Components only

import { supabaseAdmin } from '@/lib/supabase/admin';
import type { AdminUser } from './types';

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabaseAdmin
    .from('admin_users_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as AdminUser[];
}
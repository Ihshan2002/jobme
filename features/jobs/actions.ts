'use server';

// features/jobs/actions.ts

import { revalidatePath } from 'next/cache';
import { supabaseAdmin }  from '@/lib/supabase/admin';

export async function updateJobStatus(
  jobId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('jobs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function deleteJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/jobs');
  return { success: true };
}
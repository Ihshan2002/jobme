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

export async function updateApplicationStatus(
  appId: string,
  status: 'shortlisted' | 'accepted' | 'rejected',
  jobTitle: string,
  companyName: string
) {
  // 1. Update application status
  const { data: application, error: updateError } = await supabaseAdmin
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appId)
    .select('seeker_id')
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Insert notification
  const seekerId = application?.seeker_id;

  if (seekerId) {
    let title = '';
    let message = '';
    let type = 'info';

    switch (status) {
      case 'accepted':
        title = `Application Accepted: ${companyName}`;
        message = `Congratulations! Your application for the ${jobTitle} role has been accepted by ${companyName}. They will contact you shortly with the next steps.`;
        type = 'success';
        break;
      case 'rejected':
        title = `Application Update: ${companyName}`;
        message = `Unfortunately, your application for the ${jobTitle} role at ${companyName} was not selected to move forward at this time.`;
        type = 'warning';
        break;
      case 'shortlisted':
        title = `Application Shortlisted: ${companyName}`;
        message = `Great news! Your application for the ${jobTitle} role at ${companyName} has been shortlisted.`;
        type = 'success';
        break;
    }

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: seekerId,
        title,
        message,
        type
      });
  }

  revalidatePath('/recruiter/jobs');
  return { success: true };
}
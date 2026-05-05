'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function scheduleInterview(
  recruiterId: string,
  seekerId: string,
  applicationId: string,
  jobTitle: string,
  companyName: string,
  scheduledAt: string,
  meetingLink: string
) {
  // 1. Insert Interview Record
  const { data: interview, error: insertError } = await supabaseAdmin
    .from('interviews')
    .insert({
      recruiter_id: recruiterId,
      seeker_id: seekerId,
      application_id: applicationId,
      job_title: jobTitle,
      company_name: companyName,
      scheduled_at: scheduledAt,
      meeting_link: meetingLink || null
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // 2. Format Notification Date
  const dateStr = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });

  // 3. Send Notification to Seeker
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: seekerId,
      title: `Interview Scheduled: ${companyName}`,
      message: `You have an interview scheduled for the ${jobTitle} role on ${dateStr}. Please check your Upcoming Interviews section on your dashboard for details.`,
      type: 'success'
    });

  // 4. Update Application Status to Shortlisted (if not already)
  await supabaseAdmin
    .from('applications')
    .update({ status: 'shortlisted' })
    .eq('id', applicationId);

  revalidatePath('/recruiter/jobs');
  revalidatePath('/seeker/dashboard');
  
  return { success: true };
}

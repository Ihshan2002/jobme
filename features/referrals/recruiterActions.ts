'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getRecruiterReferrals(recruiterProfileId: string) {
  const { data, error } = await supabaseAdmin
    .from('referrals')
    .select(`
      id,
      status,
      created_at,
      company_feedback,
      job_title,
      note,
      seeker: profiles!referrals_seeker_id_fkey ( full_name, email ),
      companies!inner ( profile_id )
    `)
    .eq('companies.profile_id', recruiterProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching recruiter referrals:", error);
    return [];
  }
  return data;
}

export async function updateReferralStatus(
  referralId: string, 
  status: 'approved' | 'rejected', 
  company_feedback: string = ''
) {
  // 1. Update referral status
  const { data: referral, error: updateError } = await supabaseAdmin
    .from('referrals')
    .update({ status, company_feedback })
    .eq('id', referralId)
    .select(`
      id,
      application_id,
      seeker_id,
      job_title,
      companies ( name )
    `)
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const seekerId = referral?.seeker_id;
  const jobTitle = referral?.job_title || 'a position';
  const companyName = (referral?.companies as any)?.name || 'a company';

  if (seekerId) {
    const title = status === 'approved' 
      ? `Application Approved: ${companyName}`
      : `Application Update: ${companyName}`;
      
    const message = status === 'approved'
      ? `Congratulations! Your application for the ${jobTitle} role has been approved by ${companyName}. They will contact you shortly with the next steps.`
      : `Unfortunately, your application for the ${jobTitle} role at ${companyName} was not selected to move forward at this time.`;

    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: seekerId,
        title,
        message,
        type: status === 'approved' ? 'success' : 'info',
        referral_id: referral.id
      });
      
    // Update original application status as well for consistency
    await supabaseAdmin
      .from('applications')
      .update({ status: status === 'approved' ? 'shortlisted' : 'rejected' })
      .eq('id', referral.application_id);
  }

  revalidatePath('/recruiter/referrals');
  return { success: true };
}

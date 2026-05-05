'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getApplicationsForAdmin() {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      cover_letter,
      seeker_id,
      jobs (
        id,
        title,
        company_name,
        location
      ),
      seeker: profiles!applications_seeker_id_fkey (
        full_name,
        email
      ),
      referrals (
        id,
        status,
        company_id,
        companies (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
  return data;
}

export async function getCompanies() {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
  return data;
}

export async function forwardApplication(applicationId: string, companyId: string, adminId: string) {
  // Check if it's already referred to this company
  const { data: existing } = await supabaseAdmin
    .from('referrals')
    .select('id')
    .eq('application_id', applicationId)
    .eq('company_id', companyId)
    .single();

  if (existing) {
    return { success: false, error: 'Application already forwarded to this company.' };
  }

  // Fetch application details needed for the referral
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select(`
      seeker_id,
      cover_letter,
      jobs ( title )
    `)
    .eq('id', applicationId)
    .single();

  if (!application) return { success: false, error: 'Application not found.' };

  const { error } = await supabaseAdmin
    .from('referrals')
    .insert({
      application_id: applicationId,
      company_id: companyId,
      admin_id: adminId,
      seeker_id: application.seeker_id,
      job_title: (application.jobs as any)?.title || 'Unknown Title',
      note: application.cover_letter,
      status: 'pending'
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/referrals');
  return { success: true };
}

'use server';

// features/users/actions.ts

import { revalidatePath } from 'next/cache';
import { supabaseAdmin }   from '@/lib/supabase/admin';
import type { ActionResult, UserRole } from './types';


// ── 0. Create User ────────────────────────────────────────────
export async function createUser(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
): Promise<ActionResult> {
  // Step 1: Create user
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError) return { success: false, error: authError.message };

  // Step 2: Force confirm — this is the key fix!
  await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
    email_confirm: true,
  });

  // Step 3: Update profile
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role, full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', data.user.id);

  if (profileError) return { success: false, error: profileError.message };

  revalidatePath('/dashboard/users');
  return { success: true };
}

// ── 1. Update Role ────────────────────────────────────────────
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<ActionResult> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/users');
  return { success: true };
}

// ── 2. Delete Account (soft + hard) ──────────────────────────
//
// Step 1 → soft-delete in profiles  (keeps foreign keys / audit trail)
// Step 2 → hard-delete from auth.users via Admin API
//          (blocks login permanently; only possible with service_role key)
//
export async function deleteUserAccount(userId: string): Promise<ActionResult> {
  // Step 1: soft delete
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) return { success: false, error: profileError.message };

  // Step 2: remove from auth — this is the key part that needs service_role
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    // rollback soft delete so state stays consistent
    await supabaseAdmin
      .from('profiles')
      .update({ deleted_at: null })
      .eq('id', userId);
    return { success: false, error: authError.message };
  }

  revalidatePath('/users');
  return { success: true };
}

// ── 3. Toggle Ban ─────────────────────────────────────────────
//
// Uses supabaseAdmin.auth.admin.updateUserById() with ban_duration.
// This immediately kills all active sessions at the auth layer.
// We also mirror banned_until to profiles for UI display.
//
export async function toggleUserBan(
  userId: string,
  currentlyBanned: boolean
): Promise<ActionResult> {
  if (currentlyBanned) {
    // UNBAN
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
    });
    if (error) return { success: false, error: error.message };

    await supabaseAdmin
      .from('profiles')
      .update({ banned_until: null, updated_at: new Date().toISOString() })
      .eq('id', userId);
  } else {
    // BAN (effectively permanent — 100 years)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: '876000h',
    });
    if (error) return { success: false, error: error.message };

    const bannedUntil = new Date();
    bannedUntil.setFullYear(bannedUntil.getFullYear() + 100);

    await supabaseAdmin
      .from('profiles')
      .update({ banned_until: bannedUntil.toISOString(), updated_at: new Date().toISOString() })
      .eq('id', userId);
  }

  revalidatePath('/users');
  return { success: true };
}
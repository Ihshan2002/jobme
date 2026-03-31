// lib/supabase/admin.ts
// ⚠️ SERVER ONLY — never import this in a Client Component
// Uses SERVICE_ROLE_KEY → bypasses ALL Row Level Security

import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error } = await supabaseAdmin.rpc('get_policies'); // Supabase JS can't run raw SQL easily. We have to use REST endpoint on pg_policies or a function.
  // Actually, we can't query pg_policies via standard supabase JS from table.
  // We can query information_schema or just use standard POSTGRES driver.
}

test();

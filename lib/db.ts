import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  // Do not throw during build; API handlers show a clear configuration error at runtime.
}
export function db() {
  if (!url || !key) throw new Error('Supabase sozlamalari topilmadi. .env.local faylini tekshiring.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

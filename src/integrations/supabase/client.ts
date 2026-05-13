// Supabase client configuration
// Service role key must ONLY be available server-side (never in browser bundles)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://vcvvtklbyvdbysfdbnfp.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// Public client - uses anon key, respects RLS
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: typeof window !== 'undefined' ? fetch : undefined,
  },
});

// Admin client - uses service role key, ONLY for server-side use (edge functions, SSR)
// In the browser, falls back to the public client so that useAuth()
// profile-fetch fallback queries don't crash the entire UI.
// RLS policies still enforce proper access control in the browser.
const SUPABASE_SERVICE_ROLE_KEY = typeof window === 'undefined'
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : undefined;

const createAdminClient = (): ReturnType<typeof createClient<Database>> => {
  // In browser or missing key: return the public client as a safe fallback
  if (typeof window !== 'undefined' || !SUPABASE_SERVICE_ROLE_KEY) {
    return supabase;
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch,
    },
  });
};

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get: (_target, prop) => {
    return (createAdminClient() as any)[prop];
  },
});

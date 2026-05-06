import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://vcvvtklbyvdbysfdbnfp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4NzQsImV4cCI6MjA3NzE0OTg3NH0.l5AJwHeUHAOS5h3yxDw6287xX3sw1JmFJdFH9cNFRUQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3Mzg3NCwiZXhwIjoyMDc3MTQ5ODc0fQ.KV1k56566JlPRlDHs613vsCqSyibpaLG4oY_hTt39fs"
);
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vcvvtklbyvdbysfdbnfp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3Mzg3NCwiZXhwIjoyMDc3MTQ5ODc0fQ.KV1k56566JlPRlDHs613vsCqSyibpaLG4oY_hTt39fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteOldTables() {
  console.log('=== Deleting Old Tables ===\n');

  // Drop old dental/clinic tables
  const tablesToDrop = ['clinics', 'dental_services', 'dentists'];

  for (const table of tablesToDrop) {
    console.log(`Dropping ${table}...`);
    try {
      // Try to drop - this will fail if table doesn't exist or has foreign keys
      const { error } = await supabase.rpc('pg_catalog.exec', {
        query: `DROP TABLE IF EXISTS public.${table} CASCADE`
      });
      
      if (error) {
        console.log(`  Error: ${error.message}`);
      } else {
        console.log(`  ✅ Dropped ${table}`);
      }
    } catch (e: any) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log('\n=== Verifying ===');
  
  // Check if deleted
  for (const table of tablesToDrop) {
    try {
      await supabase.from(table).select('*').limit(1);
      console.log(`❌ ${table} still exists`);
    } catch (e: any) {
      if (e.message.includes('does not exist')) {
        console.log(`✅ ${table} deleted`);
      } else {
        console.log(`? ${table}: ${e.message}`);
      }
    }
  }

  console.log('\nDone!');
}

deleteOldTables();
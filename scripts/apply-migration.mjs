import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://vcvvtklbyvdbysfdbnfp.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3Mzg3NCwiZXhwIjoyMDc3MTQ5ODc0fQ.KV1k56566JlPRlDHs613vsCqSyibpaLG4oY_hTt39fs';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runMigrations() {
  console.log('Reading migration file...');
  
  const migrations = [
    '20260501000000_fostering_schema.sql'
  ];
  
  for (const migration of migrations) {
    console.log(`Running ${migration}...`);
    const sql = readFileSync(`./supabase/migrations/${migration}`, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
        if (error && !error.message.includes('already exists')) {
          console.log('Error:', error.message);
        }
      }
    }
    
    console.log(`✓ ${migration} completed`);
  }
  
  console.log('All migrations complete!');
  process.exit(0);
}

runMigrations().catch(e => {
  console.error(e);
  process.exit(1);
});
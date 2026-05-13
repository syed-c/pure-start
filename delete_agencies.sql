-- Delete all agencies and related clinic records (run this in Supabase SQL Editor)
-- This script handles both the legacy 'clinics' table and the newer 'agencies' table
DELETE FROM public.agencies;
DELETE FROM public.clinics;

-- Reset sequences if needed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'agencies_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE agencies_id_seq RESTART WITH 1';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'clinics_id_seq') THEN
    EXECUTE 'ALTER SEQUENCE clinics_id_seq RESTART WITH 1';
  END IF;
END $$;

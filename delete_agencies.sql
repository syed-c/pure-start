-- Delete all agencies (run this in Supabase SQL Editor)
DELETE FROM public.agencies;

-- Reset sequences if needed
ALTER SEQUENCE agencies_id_seq RESTART WITH 1;

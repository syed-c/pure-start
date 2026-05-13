-- Migration: Rename dentist_settings table to agency_settings
-- This migration renames the legacy dental-prefixed table to match
-- the new fostering platform terminology.
-- Date: 2026-05-12

BEGIN;

-- 1. Rename the table
ALTER TABLE public.dentist_settings RENAME TO agency_settings;

-- 2. Rename the primary key constraint
ALTER TABLE public.agency_settings RENAME CONSTRAINT dentist_settings_pkey TO agency_settings_pkey;

-- 3. Rename the foreign key constraint (referenced clinics table)
ALTER TABLE public.agency_settings RENAME CONSTRAINT dentist_settings_clinic_id_fkey TO agency_settings_clinic_id_fkey;

-- 4. Update any policy names
ALTER POLICY "Dentist settings manageable by owners/admins" ON public.agency_settings
  RENAME TO "Agency settings manageable by owners/admins";

ALTER POLICY "Dentist settings readable by owners/admins" ON public.agency_settings
  RENAME TO "Agency settings readable by owners/admins";

-- 5. Update RLS policy definitions to reference the new table name
DROP POLICY IF EXISTS "Agency settings manageable by owners/admins" ON public.agency_settings;
CREATE POLICY "Agency settings manageable by owners/admins" ON public.agency_settings
  FOR ALL USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Agency settings readable by owners/admins" ON public.agency_settings;
CREATE POLICY "Agency settings readable by owners/admins" ON public.agency_settings
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- 6. Update audit log references for entity_type values
-- (Note: Any existing audit log entries with entity_type = 'dentist_settings'
--  would need a separate data migration if historical accuracy is needed)

-- 7. Grant permissions for the renamed table
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.agency_settings TO authenticated, anon;

-- 8. Add any missing columns during migration
ALTER TABLE public.agency_settings ADD COLUMN IF NOT EXISTS agency_id uuid;
UPDATE public.agency_settings SET agency_id = clinic_id WHERE agency_id IS NULL;

COMMIT;
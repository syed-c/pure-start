-- Migration: Add missing fostering-specific tables
-- Date: 2026-05-12
-- This migration adds tables referenced in code but missing from schema.sql

-- 1. fostering_categories (referenced in SystemAuditTab, pageRegistry)
CREATE TABLE IF NOT EXISTS public.fostering_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. feature_flags (referenced in audit reports)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  roles jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- 3. agency_locations junction table (referenced in SystemAuditTab)
CREATE TABLE IF NOT EXISTS public.agency_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  city_id uuid,
  area_id uuid,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- 4. foster_carers (referenced in SystemAuditTab, navigation)
CREATE TABLE IF NOT EXISTS public.foster_carers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  organisation_id uuid,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  email text,
  phone text,
  address text,
  postcode text,
  date_of_birth date,
  gender text,
  status text NOT NULL DEFAULT 'pending',
  approval_type text,
  approval_date timestamptz,
  panel_date timestamptz,
  qualifications text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  has_car boolean DEFAULT false,
  has_own_home boolean DEFAULT false,
  can_accommodate_pets boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- 5. Ensure organisations table has the right types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organisations' AND column_name = 'type') THEN
    ALTER TABLE public.organisations ADD COLUMN type text DEFAULT 'fostering_agency';
  END IF;
END $$;

-- 6. Add missing fostering-specific columns to agencies if not present
DO $$ BEGIN
  -- Add agency_type column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'agency_type') THEN
    ALTER TABLE public.agencies ADD COLUMN agency_type text;
  END IF;

  -- Add status column if missing (draft/pending/published)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'status') THEN
    ALTER TABLE public.agencies ADD COLUMN status text DEFAULT 'published';
  END IF;

  -- Add listing_status column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'listing_status') THEN
    ALTER TABLE public.agencies ADD COLUMN listing_status text DEFAULT 'listed';
  END IF;

  -- Add areas_served column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'areas_served') THEN
    ALTER TABLE public.agencies ADD COLUMN areas_served text[] DEFAULT '{}';
  END IF;

  -- Add fostering_types_supported column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'fostering_types_supported') THEN
    ALTER TABLE public.agencies ADD COLUMN fostering_types_supported text[] DEFAULT '{}';
  END IF;

  -- Add age_groups_supported column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'age_groups_supported') THEN
    ALTER TABLE public.agencies ADD COLUMN age_groups_supported text[] DEFAULT '{}';
  END IF;

  -- Add ofsted_rating column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'ofsted_rating') THEN
    ALTER TABLE public.agencies ADD COLUMN ofsted_rating text;
  END IF;

  -- Add ofsted_urn column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'ofsted_urn') THEN
    ALTER TABLE public.agencies ADD COLUMN ofsted_urn text;
  END IF;

  -- Add has_therapeutic_team column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'has_therapeutic_team') THEN
    ALTER TABLE public.agencies ADD COLUMN has_therapeutic_team boolean DEFAULT false;
  END IF;

  -- Add approved_trainer column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'approved_trainer') THEN
    ALTER TABLE public.agencies ADD COLUMN approved_trainer boolean DEFAULT false;
  END IF;
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.fostering_categories TO authenticated, anon;
GRANT SELECT ON public.feature_flags TO authenticated, anon;
GRANT SELECT ON public.agency_locations TO authenticated, anon;
GRANT SELECT ON public.foster_carers TO authenticated, anon;

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_fostering_categories_slug ON public.fostering_categories (slug);
CREATE INDEX IF NOT EXISTS idx_fostering_categories_active ON public.fostering_categories (is_active);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags (key);
CREATE INDEX IF NOT EXISTS idx_agency_locations_agency ON public.agency_locations (agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_locations_city ON public.agency_locations (city_id);
CREATE INDEX IF NOT EXISTS idx_foster_carers_org ON public.foster_carers (organisation_id);
CREATE INDEX IF NOT EXISTS idx_foster_carers_user ON public.foster_carers (user_id);
CREATE INDEX IF NOT EXISTS idx_foster_carers_status ON public.foster_carers (status);
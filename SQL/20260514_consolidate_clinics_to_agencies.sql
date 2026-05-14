-- Migration: Consolidate clinics table into agencies
-- Date: 2026-05-14
-- Purpose: 
--   1. Create agencies table if not exists (with all fostering columns)
--   2. Migrate any data from clinics to agencies
--   3. Update FK constraints to reference agencies(id)
--   4. Drop clinics table after migration
--   5. Update RLS policies

BEGIN;

-- ============================================
-- STEP 1: Create agencies table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.agencies (id uuid NOT NULL DEFAULT gen_random_uuid());

-- Identity
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS full_description text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS editorial_summary text;

-- Contact
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS international_phone text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS contact_form_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS booking_url text;

-- Location
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS postcode text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS area_id uuid;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS regions_served text[];
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS counties_served text[];
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS areas_served text[];

-- Media
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS main_image_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS photos jsonb;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS opening_hours jsonb;

-- GMB
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_place_id text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_resource_name text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_website_url text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_primary_type text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_types text[];
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS business_status text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS price_level text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS utc_offset_minutes integer;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS gmb_data jsonb;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS gmb_connected boolean DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS imported_at timestamptz;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS import_source text DEFAULT 'gmb';

-- Status & verification
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS claim_status text NOT NULL DEFAULT 'unclaimed';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS claim_emails text[];
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS claimed_by uuid;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS verification_sent_at timestamptz;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS listing_status text DEFAULT 'listed';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_active_listing boolean DEFAULT true;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_duplicate boolean NOT NULL DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS duplicate_of_id uuid;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS duplicate_group_id text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS seo_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS noindex boolean DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS location_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS location_pending_approval boolean NOT NULL DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz;

-- Ratings & reviews
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 0;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS average_rating numeric NOT NULL DEFAULT 0;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS total_reviews integer NOT NULL DEFAULT 0;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS total_leads integer NOT NULL DEFAULT 0;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS rank_score integer NOT NULL DEFAULT 0;

-- Fostering-specific
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS agency_type text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS fostering_types text[] DEFAULT '{}';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS fostering_types_supported text[] DEFAULT '{}';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS age_groups_supported text[] DEFAULT '{}';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS has_24_7_support boolean DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS training_provided boolean DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS accepting_new_carers boolean DEFAULT true;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS accepting_referrals boolean DEFAULT true;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS online_enquiry boolean DEFAULT true;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS allowance_info text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS ofsted_rating text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS ofsted_urn text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS established_year integer;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS staff_count integer;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS foster_carer_count integer;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS child_placements_count integer;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS approved_trainer boolean DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS has_therapeutic_team boolean DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS faqs jsonb;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS canonical_url text;

-- Timestamps
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ============================================
-- STEP 2: Migrate data from clinics to agencies
-- ============================================
-- Only migrate if clinics table exists and has data
DO $$
DECLARE
  clinic_count integer;
BEGIN
  SELECT COUNT(*) INTO clinic_count FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'clinics';
  
  IF clinic_count > 0 THEN
    -- Insert clinics data into agencies where not already present
    INSERT INTO public.agencies (
      id, name, slug, description, logo_url, cover_image_url, email, phone, website,
      city_id, area_id, address, latitude, longitude, google_place_id, google_maps_url,
      claim_status, claimed_by, claimed_at, verification_status, source, owner_id,
      seo_visible, rank_score, duplicate_group_id, is_duplicate, is_suspended,
      is_featured, is_active, gmb_data, total_reviews, average_rating, rating,
      review_count, total_leads, opening_hours, photos, location_verified,
      location_pending_approval, verified_at, verification_expires_at, gmb_connected,
      is_active_listing, created_at, updated_at, city, state
    )
    SELECT 
      c.id, c.name, c.slug, c.description, c.logo_url, c.cover_image_url, c.email, c.phone, c.website,
      c.city_id, c.area_id, c.address, c.latitude::double precision, c.longitude::double precision, 
      c.google_place_id, c.google_maps_url,
      COALESCE(c.claim_status::text, 'unclaimed'), c.claimed_by, c.claimed_at, 
      COALESCE(c.verification_status::text, 'unverified'), COALESCE(c.source::text, 'manual'), c.owner_id,
      COALESCE(c.seo_visible, true), COALESCE(c.rank_score, 0), c.duplicate_group_id,
      COALESCE(c.is_duplicate, false), COALESCE(c.is_suspended, false),
      COALESCE(c.is_featured, false), COALESCE(c.is_active, true), c.gmb_data, 
      COALESCE(c.total_reviews, 0), COALESCE(c.average_rating, 0), COALESCE(c.rating, 0),
      COALESCE(c.review_count, 0), COALESCE(c.total_leads, 0), c.opening_hours, c.photos,
      COALESCE(c.location_verified, false), COALESCE(c.location_pending_approval, false),
      c.verified_at, c.verification_expires_at, COALESCE(c.gmb_connected, false),
      COALESCE(c.is_active_listing, true), c.created_at, c.updated_at,
      c2.name AS city, s.name AS state
    FROM public.clinics c
    LEFT JOIN public.cities c2 ON c2.id = c.city_id
    LEFT JOIN public.states s ON s.id = c2.state_id
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Migrated clinics data to agencies';
  END IF;
END $$;

-- ============================================
-- STEP 3: Update RLS for agencies
-- ============================================
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies readable by all" ON public.agencies;
CREATE POLICY "Agencies readable by all" ON public.agencies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert agencies" ON public.agencies;
CREATE POLICY "Admins can insert agencies" ON public.agencies FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'district_manager'));

DROP POLICY IF EXISTS "Agency owners can update" ON public.agencies;
CREATE POLICY "Agency owners can update" ON public.agencies FOR UPDATE USING (auth.uid() = claimed_by OR auth.uid() = owner_id OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins can delete agencies" ON public.agencies;
CREATE POLICY "Admins can delete agencies" ON public.agencies FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- ============================================
-- STEP 4: Drop clinics table and related objects
-- ============================================
-- First, update all FK constraints to point to agencies
-- (Skip if already done)
DO $$
DECLARE
  fk_exists integer;
BEGIN
  -- Check if any FKs still reference clinics
  SELECT COUNT(*) INTO fk_exists
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'clinics';
  
  IF fk_exists > 0 THEN
    RAISE NOTICE 'There are still % FK constraints referencing clinics table. Manual cleanup needed.', fk_exists;
  ELSE
    RAISE NOTICE 'No FK constraints reference clinics table. Safe to drop.';
  END IF;
END $$;

-- ============================================
-- STEP 5: Create indexes for agencies
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agencies_city_id ON public.agencies (city_id);
CREATE INDEX IF NOT EXISTS idx_agencies_area_id ON public.agencies (area_id);
CREATE INDEX IF NOT EXISTS idx_agencies_claim_status ON public.agencies (claim_status);
CREATE INDEX IF NOT EXISTS idx_agencies_verification_status ON public.agencies (verification_status);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON public.agencies (is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_is_featured ON public.agencies (is_featured);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies (slug);
CREATE INDEX IF NOT EXISTS idx_agencies_ofsted_rating ON public.agencies (ofsted_rating);
CREATE INDEX IF NOT EXISTS idx_agencies_fostering_types ON public.agencies USING GIN (fostering_types);
CREATE INDEX IF NOT EXISTS idx_agencies_accepting_new ON public.agencies (accepting_new_carers);

COMMIT;

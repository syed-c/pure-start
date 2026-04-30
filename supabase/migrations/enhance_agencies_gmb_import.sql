-- =============================================================================
-- ENHANCE AGENCIES TABLE FOR GMB IMPORT
-- =============================================================================
-- Add columns needed for comprehensive Google Places import

-- 1. Google-specific fields
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_resource_name TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_website_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS international_phone TEXT;

-- 2. Description fields
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS editorial_summary TEXT;

-- 3. Status and workflow
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' 
  CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived'));
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS listing_status TEXT DEFAULT 'unlisted'
  CHECK (listing_status IN ('unlisted', 'listed', 'featured', 'promoted'));
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed'
  CHECK (claim_status IN ('unclaimed', 'claimed', 'under_review', 'approved', 'rejected'));

-- 4. Image fields
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 5. Google profile data
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_primary_type TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS google_types TEXT[];
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS business_status TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS price_level TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS utc_offset_minutes INTEGER;

-- 6. Import tracking
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'gmb';

-- 7. Duplicate detection
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS duplicate_of_id UUID REFERENCES agencies(id);

-- 8. SEO fields
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT false;

-- Copy place_id to google_place_id where not already set
UPDATE public.agencies 
SET google_place_id = place_id 
WHERE google_place_id IS NULL AND place_id IS NOT NULL;

-- Set default values for existing records
UPDATE public.agencies 
SET status = 'published' 
WHERE status = 'draft' AND is_verified = true;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agencies_google_place_id ON agencies(google_place_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_listing_status ON agencies(listing_status);
CREATE INDEX IF NOT EXISTS idx_agencies_claim_status ON agencies(claim_status);
CREATE INDEX IF NOT EXISTS idx_agencies_google_types ON agencies USING GIN(google_types);
CREATE INDEX IF NOT EXISTS idx_agencies_imported_at ON agencies(imported_at);

-- =============================================================================
-- CREATE SUPPORTING TABLES
-- =============================================================================

-- 1. Agency Opening Hours
CREATE TABLE IF NOT EXISTS public.agency_opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TEXT,
  close_time TEXT,
  is_closed BOOLEAN DEFAULT false,
  is_24_hours BOOLEAN DEFAULT false,
  is_special_hours BOOLEAN DEFAULT false,
  special_date DATE,
  weekday_text TEXT,
  source TEXT DEFAULT 'google',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_agency_opening_hours_agency_id ON agency_opening_hours(agency_id);

-- 2. Agency Photos
CREATE TABLE IF NOT EXISTS public.agency_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  photo_type TEXT DEFAULT 'gallery' CHECK (photo_type IN ('logo', 'main', 'gallery', 'team', 'facility', 'other')),
  google_photo_name TEXT,
  google_photo_reference TEXT,
  photo_url TEXT,
  local_url TEXT,
  width INTEGER,
  height INTEGER,
  attribution TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'google',
  display_order INTEGER DEFAULT 0,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_photos_agency_id ON agency_photos(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_photos_is_primary ON agency_photos(agency_id, is_primary) WHERE is_primary = true;

-- 3. Agency Reviews
CREATE TABLE IF NOT EXISTS public.agency_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'google' CHECK (source IN ('google', 'trustpilot', 'facebook', 'manual')),
  source_review_id TEXT,
  reviewer_name TEXT,
  reviewer_profile_url TEXT,
  reviewer_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_language TEXT,
  review_time TIMESTAMPTZ,
  relative_time_description TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_displayed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, source, source_review_id)
);

CREATE INDEX IF NOT EXISTS idx_agency_reviews_agency_id ON agency_reviews(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_reviews_rating ON agency_reviews(agency_id, rating);

-- 4. Import Jobs
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('search', 'import_new', 'import_update', 'import_photos', 'import_hours', 'import_reviews', 'sync_all', 'recheck')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
  filters_json JSONB DEFAULT '{}',
  requested_by_user_id UUID REFERENCES auth.users(id),
  total_queries INTEGER DEFAULT 0,
  total_results_found INTEGER DEFAULT 0,
  total_imported INTEGER DEFAULT 0,
  total_updated INTEGER DEFAULT 0,
  total_duplicates INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  api_calls_used INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at DESC);

-- 5. Import Job Results
CREATE TABLE IF NOT EXISTS public.import_job_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  google_place_id TEXT,
  agency_id UUID REFERENCES agencies(id),
  business_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('imported', 'updated', 'duplicate', 'skipped', 'failed', 'needs_review')),
  match_confidence TEXT CHECK (match_confidence IN ('high', 'medium', 'low')),
  action_taken TEXT,
  error_message TEXT,
  raw_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_job_results_job_id ON import_job_results(import_job_id);
CREATE INDEX IF NOT EXISTS idx_import_job_results_agency_id ON import_job_results(agency_id);

-- =============================================================================
-- ADD RLS POLICIES
-- =============================================================================
-- ADD RLS POLICIES (use OR REPLACE to avoid errors if already exists)
-- =============================================================================

ALTER TABLE public.agency_opening_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read agency_opening_hours" ON public.agency_opening_hours;
CREATE POLICY "Anyone can read agency_opening_hours" ON public.agency_opening_hours FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service can insert agency_opening_hours" ON public.agency_opening_hours;
CREATE POLICY "Service can insert agency_opening_hours" ON public.agency_opening_hours FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update agency_opening_hours" ON public.agency_opening_hours;
CREATE POLICY "Service can update agency_opening_hours" ON public.agency_opening_hours FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Service can delete agency_opening_hours" ON public.agency_opening_hours;
CREATE POLICY "Service can delete agency_opening_hours" ON public.agency_opening_hours FOR DELETE USING (true);

ALTER TABLE public.agency_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read agency_photos" ON public.agency_photos;
CREATE POLICY "Anyone can read agency_photos" ON public.agency_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service can insert agency_photos" ON public.agency_photos;
CREATE POLICY "Service can insert agency_photos" ON public.agency_photos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update agency_photos" ON public.agency_photos;
CREATE POLICY "Service can update agency_photos" ON public.agency_photos FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Service can delete agency_photos" ON public.agency_photos;
CREATE POLICY "Service can delete agency_photos" ON public.agency_photos FOR DELETE USING (true);

ALTER TABLE public.agency_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read agency_reviews" ON public.agency_reviews;
CREATE POLICY "Anyone can read agency_reviews" ON public.agency_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service can insert agency_reviews" ON public.agency_reviews;
CREATE POLICY "Service can insert agency_reviews" ON public.agency_reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update agency_reviews" ON public.agency_reviews;
CREATE POLICY "Service can update agency_reviews" ON public.agency_reviews FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Service can delete agency_reviews" ON public.agency_reviews;
CREATE POLICY "Service can delete agency_reviews" ON public.agency_reviews FOR DELETE USING (true);

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read import_jobs" ON public.import_jobs;
CREATE POLICY "Anyone can read import_jobs" ON public.import_jobs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service can insert import_jobs" ON public.import_jobs;
CREATE POLICY "Service can insert import_jobs" ON public.import_jobs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update import_jobs" ON public.import_jobs;
CREATE POLICY "Service can update import_jobs" ON public.import_jobs FOR UPDATE USING (true);

ALTER TABLE public.import_job_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read import_job_results" ON public.import_job_results;
CREATE POLICY "Anyone can read import_job_results" ON public.import_job_results FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service can insert import_job_results" ON public.import_job_results;
CREATE POLICY "Service can insert import_job_results" ON public.import_job_results FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update import_job_results" ON public.import_job_results;
CREATE POLICY "Service can update import_job_results" ON public.import_job_results FOR UPDATE USING (true);

-- =============================================================================
-- ADD UPDATED_AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agency_opening_hours_updated_at
  BEFORE UPDATE ON public.agency_opening_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_photos_updated_at
  BEFORE UPDATE ON public.agency_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_reviews_updated_at
  BEFORE UPDATE ON public.agency_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_jobs_updated_at
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_job_results_updated_at
  BEFORE UPDATE ON public.import_job_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
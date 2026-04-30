-- =====================================================
-- AGENCY/FOSTERING PLATFORM DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. STATES/REGIONS table
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abbreviation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CITIES table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id UUID REFERENCES public.states(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, state_id)
);

-- 3. AREAS table
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, city_id)
);

-- 4. CLINICS/AGENCIES table (main listing table)
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  latitude FLOAT,
  longitude FLOAT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  claim_status TEXT DEFAULT 'unclaimed', -- unclaimed, pending, claimed
  verification_status TEXT DEFAULT 'unverified', -- unverified, pending, verified
  ofsted_rating TEXT,
  ofsted_report_url TEXT,
  source TEXT DEFAULT 'manual', -- manual, gmb, csv
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  logo_url TEXT,
  photos JSONB,
  opening_hours JSONB,
  gmb_data JSONB,
  gmb_connected BOOLEAN DEFAULT false,
  google_place_id TEXT,
  google_maps_url TEXT,
  city_id UUID REFERENCES public.cities(id),
  area_id UUID REFERENCES public.areas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SEO PAGES table (already created, just ensure it has all columns)
ALTER TABLE public.seo_pages 
ADD COLUMN IF NOT EXISTS h1 TEXT,
ADD COLUMN IF NOT EXISTS page_intro TEXT,
ADD COLUMN IF NOT EXISTS h2_sections JSONB,
ADD COLUMN IF NOT EXISTS internal_links_intro TEXT;

-- 6. GMB IMPORTS table (tracking imports)
CREATE TABLE IF NOT EXISTS public.gmb_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  user_id UUID REFERENCES auth.users(id),
  city_id UUID REFERENCES public.cities(id),
  area_id UUID REFERENCES public.areas(id),
  category TEXT,
  places_found INTEGER DEFAULT 0,
  places_imported INTEGER DEFAULT 0,
  places_skipped INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTENT VERSIONS table (for rollback)
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_page_id UUID REFERENCES public.seo_pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  h1 TEXT,
  content TEXT,
  page_intro TEXT,
  h2_sections JSONB,
  meta_title TEXT,
  meta_description TEXT,
  faqs JSONB,
  seo_score NUMERIC(5,2),
  source TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read
CREATE POLICY "Anyone can read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Anyone can read areas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Anyone can read clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Anyone can read gmb_imports" ON public.gmb_imports FOR SELECT USING (true);
CREATE POLICY "Anyone can read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can read content_versions" ON public.content_versions FOR SELECT USING (true);

-- RLS Policies - Service role full access
CREATE POLICY "Service can do everything states" ON public.states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything cities" ON public.cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything areas" ON public.areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything clinics" ON public.clinics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything gmb_imports" ON public.gmb_imports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything content_versions" ON public.content_versions FOR ALL USING (true) WITH CHECK (true);

-- Insert default UK regions
INSERT INTO public.states (name, slug, abbreviation, is_active) VALUES
  ('England', 'england', 'EN', true),
  ('Scotland', 'scotland', 'SC', true),
  ('Wales', 'wales', 'WA', true),
  ('Northern Ireland', 'northern-ireland', 'NI', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert some cities
INSERT INTO public.cities (name, slug, state_id, is_active)
SELECT name, slug, id, true
FROM (
  SELECT 'London' as name, 'london' as slug FROM public.states WHERE slug = 'england'
  UNION ALL SELECT 'Birmingham', 'birmingham' FROM public.states WHERE slug = 'england'
  UNION ALL SELECT 'Manchester', 'manchester' FROM public.states WHERE slug = 'england'
  UNION ALL SELECT 'Leeds', 'leeds' FROM public.states WHERE slug = 'england'
  UNION ALL SELECT 'Liverpool', 'liverpool' FROM public.states WHERE slug = 'england'
  UNION ALL SELECT 'Bristol', 'bristol' FROM public.states WHERE slug = 'england'
  UNION ALL SELECT 'Edinburgh', 'edinburgh' FROM public.states WHERE slug = 'scotland'
  UNION ALL SELECT 'Glasgow', 'glasgow' FROM public.states WHERE slug = 'scotland'
  UNION ALL SELECT 'Cardiff', 'cardiff' FROM public.states WHERE slug = 'wales'
  UNION ALL SELECT 'Belfast', 'belfast' FROM public.states WHERE slug = 'northern-ireland'
) AS cities
ON CONFLICT (slug, state_id) DO NOTHING;

-- Verify setup
SELECT 'Tables created successfully!' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- =====================================================
-- COMPLETE DATABASE SETUP FOR FOSTER CARE PLATFORM
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. REPUTATION TABLES
-- -----------------

-- Google Reviews table
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  reviewer_id TEXT,
  rating INTEGER,
  review_text TEXT,
  review_date TIMESTAMPTZ,
  review_datetime TIMESTAMPTZ,
  rating_date TIMESTAMPTZ,
  star_rating INTEGER,
  comment TEXT,
  photo_urls JSONB,
  is_deleted BOOLEAN DEFAULT false,
  sentiment_score NUMERIC,
  sentiment_label TEXT,
  response_text TEXT,
  response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internal Reviews table
CREATE TABLE IF NOT EXISTS public.internal_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_name TEXT,
  patient_email TEXT,
  rating INTEGER,
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reputation KPIs table
CREATE TABLE IF NOT EXISTS public.reputation_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  average_rating NUMERIC(3,2),
  total_reviews INTEGER,
  sentiment_score NUMERIC,
  risk_score NUMERIC,
  growth_rate NUMERIC,
  response_rate NUMERIC,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Clicks table (analytics)
CREATE TABLE IF NOT EXISTS public.review_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (enhanced)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS
-- -----------
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- ---------------
-- Anyone can read
CREATE POLICY "Anyone can read google_reviews" ON public.google_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can read internal_reviews" ON public.internal_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can read reputation_kpis" ON public.reputation_kpis FOR SELECT USING (true);
CREATE POLICY "Anyone can read review_clicks" ON public.review_clicks FOR SELECT USING (true);
CREATE POLICY "Anyone can read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can read alerts" ON public.alerts FOR SELECT USING (true);

-- Service can do everything
CREATE POLICY "Service can do everything google_reviews" ON public.google_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything internal_reviews" ON public.internal_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything reputation_kpis" ON public.reputation_kpis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything review_clicks" ON public.review_clicks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

-- 4. ADDITIONAL TABLES NEEDED
-- ----------------------

-- Profile table (enhanced)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GMB Imports table
CREATE TABLE IF NOT EXISTS public.gmb_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  user_id UUID REFERENCES auth.users(id),
  city_id UUID REFERENCES public.cities(id),
  category TEXT,
  places_found INTEGER DEFAULT 0,
  places_imported INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_log JSONB
);

-- Agencies table (already exists, verify structure)
-- Add missing columns if needed
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id),
ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id),
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS review_count INTEGER,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS gmb_data JSONB;

-- Enable RLS on profile and gmb_imports
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_imports ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can read gmb_imports" ON public.gmb_imports FOR SELECT USING (true);
CREATE POLICY "Service can do everything profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can do everything gmb_imports" ON public.gmb_imports FOR ALL USING (true) WITH CHECK (true);

-- 5. SEO PAGES ENHANCEMENTS
-- ----------------------
ALTER TABLE public.seo_pages 
ADD COLUMN IF NOT EXISTS page_intro TEXT,
ADD COLUMN IF NOT EXISTS h2_sections JSONB,
ADD COLUMN IF NOT EXISTS internal_links_intro TEXT,
ADD COLUMN IF NOT EXISTS faqs JSONB,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS last_content_edit_source TEXT,
ADD COLUMN IF NOT EXISTS last_faq_edit_source TEXT,
ADD COLUMN IF NOT EXISTS is_optimized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS optimized_at TIMESTAMPTZ;

-- 6. CONTENT VERSIONS TABLE
-- ---------------------
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
  source TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read content_versions" ON public.content_versions FOR SELECT USING (true);
CREATE POLICY "Service can do everything content_versions" ON public.content_versions FOR ALL USING (true) WITH CHECK (true);

-- 7. VERIFY SETUP
-- --------------
SELECT 'All tables created!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('states', 'cities', 'clinics', 'agencies', 'seo_pages', 
                'google_reviews', 'internal_reviews', 'reputation_kpis', 
                'review_clicks', 'audit_logs', 'alerts', 'profiles',
                'gmb_imports', 'content_versions', 'global_settings')
ORDER BY table_name;
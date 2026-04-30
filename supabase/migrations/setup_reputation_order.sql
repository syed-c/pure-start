-- 1. CLINICS TABLE FIRST
-- ---------------------
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
  claim_status TEXT DEFAULT 'unclaimed',
  verification_status TEXT DEFAULT 'unverified',
  ofsted_rating TEXT,
  ofsted_report_url TEXT,
  source TEXT DEFAULT 'manual',
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  logo_url TEXT,
  photos JSONB,
  opening_hours JSONB,
  gmb_data JSONB,
  gmb_connected BOOLEAN DEFAULT false,
  google_place_id TEXT,
  google_maps_url TEXT,
  city_id UUID,
  area_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Service full clinics" ON public.clinics FOR ALL USING (true) WITH CHECK (true);

-- 2. NOW CREATE TABLES THAT REFERENCE CLINICS
-- -----------------------------------

-- Google Reviews
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  reviewer_id TEXT,
  rating INTEGER,
  review_text TEXT,
  review_date TIMESTAMPTZ,
  star_rating INTEGER,
  comment TEXT,
  sentiment_score NUMERIC,
  sentiment_label TEXT,
  response_text TEXT,
  response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internal Reviews
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

-- Reputation KPIs
CREATE TABLE IF NOT EXISTS public.reputation_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  average_rating NUMERIC(3,2),
  total_reviews INTEGER,
  sentiment_score NUMERIC,
  risk_score NUMERIC,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (already exists, just ensure it exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
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

-- 3. ENABLE RLS ON ALL NEW TABLES
-- ---------------------------
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- --------------------
-- Read policies
CREATE POLICY "Anyone can read google_reviews" ON public.google_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can read internal_reviews" ON public.internal_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can read reputation_kpis" ON public.reputation_kpis FOR SELECT USING (true);
CREATE POLICY "Anyone can read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can read alerts" ON public.alerts FOR SELECT USING (true);

-- Full access
CREATE POLICY "Service full google_reviews" ON public.google_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full internal_reviews" ON public.internal_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full reputation_kpis" ON public.reputation_kpis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

-- 5. VERIFY
-- ----------
SELECT 'Setup complete!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clinics', 'google_reviews', 'internal_reviews', 'reputation_kpis', 'audit_logs', 'alerts')
ORDER BY table_name;
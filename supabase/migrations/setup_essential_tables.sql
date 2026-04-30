-- Essential tables for Foster Care app
-- Run this in Supabase SQL Editor

-- 1. User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'content_team', 'seo_team', 'dentist', 'agency')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 2. Profiles (user extended info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEO Pages (for Content Admin)
CREATE TABLE IF NOT EXISTS public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  page_type TEXT NOT NULL,
  title TEXT,
  h1 TEXT,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  word_count INTEGER,
  is_indexed BOOLEAN DEFAULT true,
  is_thin_content BOOLEAN DEFAULT false,
  is_optimized BOOLEAN DEFAULT false,
  needs_optimization BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agencies/Clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  average_rating NUMERIC(3,2),
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Regions/States for UK
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abbr TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Cities
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id UUID REFERENCES public.states(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, state_id)
);

-- 7. Fostering Categories/Treatments
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read user_roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can read seo_pages" ON public.seo_pages FOR SELECT USING (true);
CREATE POLICY "Anyone can read clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Anyone can read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Anyone can read treatments" ON public.treatments FOR SELECT USING (true);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access seo_pages" ON public.seo_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access clinics" ON public.clinics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access states" ON public.states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cities" ON public.cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access treatments" ON public.treatments FOR ALL USING (true) WITH CHECK (true);

-- Verify tables created
SELECT 'user_roles' as tbl, COUNT(*) as cnt FROM public.user_roles
UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL SELECT 'seo_pages', COUNT(*) FROM public.seo_pages
UNION ALL SELECT 'clinics', COUNT(*) FROM public.clinics
UNION ALL SELECT 'states', COUNT(*) FROM public.states
UNION ALL SELECT 'cities', COUNT(*) FROM public.cities
UNION ALL SELECT 'treatments', COUNT(*) FROM public.treatments;

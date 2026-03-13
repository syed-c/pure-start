-- =====================================================
-- Foster Connect — Database Setup SQL
-- Run this on your external Supabase instance
-- =====================================================

-- 1. Enum types
CREATE TYPE public.app_role AS ENUM ('super_admin', 'regional_manager', 'agency_admin', 'user');
CREATE TYPE public.claim_status AS ENUM ('unclaimed', 'pending', 'claimed');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'expired');
CREATE TYPE public.agency_source AS ENUM ('manual', 'import', 'ofsted');
CREATE TYPE public.enquiry_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'closed', 'spam');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.review_sentiment AS ENUM ('positive', 'negative');
CREATE TYPE public.seo_page_type AS ENUM ('region', 'city', 'category', 'city_category', 'agency');
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE public.agency_type AS ENUM ('independent', 'local_authority');
CREATE TYPE public.fostering_type AS ENUM ('emergency', 'respite', 'parent_child', 'therapeutic', 'long_term', 'short_term', 'disability_complex');

-- 2. Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User Roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. States (Nations / Regions)
CREATE TABLE public.states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  abbreviation text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT 'GB',
  image_url text,
  agency_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read states" ON public.states FOR SELECT USING (true);

-- 5. Cities
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  state_id uuid REFERENCES public.states(id),
  country text DEFAULT 'GB',
  image_url text,
  agency_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slug, state_id)
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cities" ON public.cities FOR SELECT USING (true);

-- 6. Areas
CREATE TABLE public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES public.cities(id),
  name text NOT NULL,
  slug text NOT NULL,
  image_url text,
  agency_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read areas" ON public.areas FOR SELECT USING (true);

-- 7. Fostering Categories (replaces treatments)
CREATE TABLE public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read treatments" ON public.treatments FOR SELECT USING (true);

-- 8. Agencies (uses clinics table name for backward compat)
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  cover_image_url text,
  email text,
  phone text,
  website text,
  city_id uuid REFERENCES public.cities(id),
  area_id uuid REFERENCES public.areas(id),
  address text,
  latitude numeric,
  longitude numeric,
  google_place_id text,
  claim_status claim_status DEFAULT 'unclaimed',
  verification_status verification_status DEFAULT 'unverified',
  source agency_source DEFAULT 'manual',
  owner_id uuid REFERENCES auth.users(id),
  claimed_by uuid REFERENCES auth.users(id),
  seo_visible boolean DEFAULT true,
  rank_score integer DEFAULT 0,
  duplicate_group_id text,
  is_duplicate boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  total_reviews integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  total_enquiries integer DEFAULT 0,
  agency_type agency_type,
  ofsted_rating text,
  ofsted_urn text,
  age_groups_supported text[],
  fostering_types fostering_type[],
  areas_served text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  verification_expires_at timestamptz
);
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read clinics" ON public.clinics FOR SELECT USING (true);

-- 9. Leads / Enquiries
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  category_id uuid REFERENCES public.treatments(id),
  enquirer_name text NOT NULL,
  enquirer_email text,
  enquirer_phone text NOT NULL,
  message text,
  source text DEFAULT 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status enquiry_status DEFAULT 'new',
  notes text,
  is_spam boolean DEFAULT false,
  fostering_interest text,
  location_preference text,
  experience_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  converted_at timestamptz
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 10. Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_name text NOT NULL,
  reviewer_email text,
  rating integer,
  title text,
  content text,
  initial_sentiment review_sentiment,
  status review_status DEFAULT 'pending',
  rejection_reason text,
  moderated_by uuid,
  moderated_at timestamptz,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

-- 11. SEO Pages
CREATE TABLE public.seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type seo_page_type,
  state_id uuid REFERENCES public.states(id),
  city_id uuid REFERENCES public.cities(id),
  treatment_id uuid REFERENCES public.treatments(id),
  clinic_id uuid REFERENCES public.clinics(id),
  slug text NOT NULL,
  title text,
  meta_title text,
  meta_description text,
  h1 text,
  content text,
  is_indexed boolean DEFAULT true,
  is_published boolean DEFAULT false,
  is_optimized boolean DEFAULT false,
  is_thin_content boolean DEFAULT false,
  is_duplicate boolean DEFAULT false,
  ai_suggestions jsonb,
  faqs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read seo_pages" ON public.seo_pages FOR SELECT USING (true);

-- 12. Global Settings
CREATE TABLE public.global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read global_settings" ON public.global_settings FOR SELECT USING (true);

-- 13. Schema Settings
CREATE TABLE public.schema_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.schema_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read schema_settings" ON public.schema_settings FOR SELECT USING (true);

-- 14. Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  user_role text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 15. has_role function for RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =====================================================
-- SEED DATA
-- =====================================================

-- UK Nations
INSERT INTO public.states (name, slug, abbreviation, country_code, is_active, display_order) VALUES
('England', 'england', 'ENG', 'GB', true, 1),
('Scotland', 'scotland', 'SCT', 'GB', true, 2),
('Wales', 'wales', 'WLS', 'GB', true, 3),
('Northern Ireland', 'northern-ireland', 'NIR', 'GB', true, 4);

-- Major English Cities
INSERT INTO public.cities (name, slug, state_id, country, is_active) VALUES
('London', 'london', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Birmingham', 'birmingham', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Manchester', 'manchester', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Leeds', 'leeds', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Liverpool', 'liverpool', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Bristol', 'bristol', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Sheffield', 'sheffield', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Newcastle', 'newcastle', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Nottingham', 'nottingham', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Leicester', 'leicester', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Coventry', 'coventry', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Bradford', 'bradford', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Southampton', 'southampton', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Brighton', 'brighton', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Plymouth', 'plymouth', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Reading', 'reading', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Derby', 'derby', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Oxford', 'oxford', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('Cambridge', 'cambridge', (SELECT id FROM states WHERE slug = 'england'), 'GB', true),
('York', 'york', (SELECT id FROM states WHERE slug = 'england'), 'GB', true);

-- Fostering Categories (in treatments table for backward compat)
INSERT INTO public.treatments (name, slug, description, display_order, is_active) VALUES
('Emergency Fostering', 'emergency-fostering', 'Immediate, short-notice placements for children who need urgent care.', 1, true),
('Respite Fostering', 'respite-fostering', 'Short breaks for children and their foster or birth families.', 2, true),
('Long-Term Fostering', 'long-term-fostering', 'Providing a stable, permanent home for children who cannot return to their birth families.', 3, true),
('Short-Term Fostering', 'short-term-fostering', 'Temporary care while plans are made for a child''s future.', 4, true),
('Parent & Child Fostering', 'parent-child-fostering', 'Supporting a parent and child together in a foster placement.', 5, true),
('Therapeutic Fostering', 'therapeutic-fostering', 'Specialist placements for children with emotional or behavioural difficulties.', 6, true),
('Disability & Complex Needs', 'disability-complex-needs', 'Fostering children with physical disabilities, learning difficulties, or complex health needs.', 7, true),
('Independent Fostering Agencies', 'independent-fostering-agencies', 'Private agencies approved by Ofsted to recruit and support foster carers.', 8, true),
('Local Authority Fostering', 'local-authority-fostering', 'Fostering services run by your local council.', 9, true);

-- Platform settings
INSERT INTO public.global_settings (key, value) VALUES
('platform', '{"site_name": "Foster Connect", "site_url": "https://www.fosterconnect.co.uk", "tagline": "UK Fostering Agency Directory"}'::jsonb),
('contact_details', '{"support_email": "support@fosterconnect.co.uk", "country": "United Kingdom", "city": "London", "state": "England"}'::jsonb);

-- Schema settings
INSERT INTO public.schema_settings (setting_key, setting_value) VALUES
('organization', '{"name": "Foster Connect", "url": "https://www.fosterconnect.co.uk", "description": "Find trusted fostering agencies across England and the UK.", "address": {"addressCountry": "GB", "addressLocality": "London", "addressRegion": "England"}}'::jsonb),
('sitewide', '{"defaultRating": 4.5, "enableBreadcrumbs": true, "enableFAQSchema": true, "enableReviewSchema": true, "enableLocalBusinessSchema": true}'::jsonb);

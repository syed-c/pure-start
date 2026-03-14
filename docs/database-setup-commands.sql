-- ============================================================================
-- FOSTER CONNECT — COMPLETE DATABASE SETUP & DATA COMMANDS
-- ============================================================================
-- Run these in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Execute each section in order. Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================================


-- ============================================================================
-- SECTION 1: MISSING TABLES (Schema Changes)
-- ============================================================================

-- 1A. reputation_alerts — Referenced by ReputationOverviewTab but doesn't exist
CREATE TABLE IF NOT EXISTS public.reputation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'review',
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reputation_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reputation_alerts"
  ON public.reputation_alerts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 1B. section_content — CMS system for page sections
CREATE TABLE IF NOT EXISTS public.section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_order INT DEFAULT 0,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  metadata JSONB,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_slug, section_key)
);
ALTER TABLE public.section_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read section_content"
  ON public.section_content FOR SELECT USING (true);

CREATE POLICY "Admins can manage section_content"
  ON public.section_content FOR ALL TO authenticated
  USING (true) WITH CHECK (true);


-- ============================================================================
-- SECTION 2: ADD UNIQUE CONSTRAINT ON seo_pages.slug
-- (Required for the setup-state-seo-pages edge function upsert)
-- ============================================================================

-- Check if constraint exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seo_pages_slug_key'
  ) THEN
    ALTER TABLE public.seo_pages ADD CONSTRAINT seo_pages_slug_key UNIQUE (slug);
  END IF;
END $$;


-- ============================================================================
-- SECTION 3: ADD 'static' TO seo_page_type ENUM
-- (The setup function creates static pages but the enum may not include it)
-- ============================================================================

-- Add missing enum values safely
DO $$
BEGIN
  -- Add 'static' if missing
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'static' AND enumtypid = 'seo_page_type'::regtype) THEN
    ALTER TYPE seo_page_type ADD VALUE 'static';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add static to seo_page_type: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agency' AND enumtypid = 'seo_page_type'::regtype) THEN
    ALTER TYPE seo_page_type ADD VALUE 'agency';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add agency to seo_page_type: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'category' AND enumtypid = 'seo_page_type'::regtype) THEN
    ALTER TYPE seo_page_type ADD VALUE 'category';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add category to seo_page_type: %', SQLERRM;
END $$;


-- ============================================================================
-- SECTION 4: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- 4A. states — Add agency_count column (code references it)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'states' AND column_name = 'agency_count') THEN
    ALTER TABLE public.states ADD COLUMN agency_count INT DEFAULT 0;
  END IF;
END $$;

-- 4B. cities — Add agency_count column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'agency_count') THEN
    ALTER TABLE public.cities ADD COLUMN agency_count INT DEFAULT 0;
  END IF;
END $$;

-- 4C. clinics — Add fostering-specific columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'ofsted_rating') THEN
    ALTER TABLE public.clinics ADD COLUMN ofsted_rating TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'ofsted_urn') THEN
    ALTER TABLE public.clinics ADD COLUMN ofsted_urn TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'fostering_types') THEN
    ALTER TABLE public.clinics ADD COLUMN fostering_types TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'agency_type') THEN
    ALTER TABLE public.clinics ADD COLUMN agency_type TEXT DEFAULT 'independent';
  END IF;
END $$;


-- ============================================================================
-- SECTION 5: INSERT FOSTERING CATEGORY DATA INTO treatments TABLE
-- ============================================================================

INSERT INTO public.treatments (name, slug, description, display_order, is_active) VALUES
  ('Independent Fostering Agency', 'independent-fostering-agency', 'Private fostering agencies regulated by Ofsted providing comprehensive support to foster carers.', 1, true),
  ('Local Authority Fostering', 'local-authority-fostering', 'Council-run fostering services managed by local authorities across England, Scotland, Wales, and Northern Ireland.', 2, true),
  ('Emergency Fostering', 'emergency-fostering', 'Urgent short-notice placements for children who need immediate care, often available 24/7.', 3, true),
  ('Respite Fostering', 'respite-fostering', 'Planned short breaks to support existing foster carers or birth families, typically lasting a few days to two weeks.', 4, true),
  ('Parent & Child Fostering', 'parent-and-child-fostering', 'Placements where a parent and their child are fostered together, with assessment and support provided.', 5, true),
  ('Therapeutic Fostering', 'therapeutic-fostering', 'Specialist placements for children with complex emotional, behavioural, or developmental needs.', 6, true),
  ('Long-Term Fostering', 'long-term-fostering', 'Stable, permanent foster placements for children who cannot return to their birth families.', 7, true),
  ('Short-Term Fostering', 'short-term-fostering', 'Temporary placements lasting from a few weeks to several months while longer-term plans are made.', 8, true),
  ('Disability & Complex Needs Fostering', 'disability-complex-needs-fostering', 'Specialist fostering for children with physical disabilities, learning difficulties, or complex health needs.', 9, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;


-- ============================================================================
-- SECTION 6: INSERT/UPDATE UK REGIONS (states TABLE)
-- ============================================================================

INSERT INTO public.states (name, slug, abbreviation, country_code, display_order, is_active) VALUES
  ('England', 'england', 'ENG', 'GB', 1, true),
  ('Scotland', 'scotland', 'SCT', 'GB', 2, true),
  ('Wales', 'wales', 'WLS', 'GB', 3, true),
  ('Northern Ireland', 'northern-ireland', 'NIR', 'GB', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  abbreviation = EXCLUDED.abbreviation,
  country_code = 'GB',
  is_active = true,
  display_order = EXCLUDED.display_order;


-- ============================================================================
-- SECTION 7: INSERT UK CITIES (cities TABLE)
-- ============================================================================

-- First get England's ID for city inserts
DO $$
DECLARE
  england_id UUID;
  scotland_id UUID;
  wales_id UUID;
  ni_id UUID;
BEGIN
  SELECT id INTO england_id FROM public.states WHERE slug = 'england';
  SELECT id INTO scotland_id FROM public.states WHERE slug = 'scotland';
  SELECT id INTO wales_id FROM public.states WHERE slug = 'wales';
  SELECT id INTO ni_id FROM public.states WHERE slug = 'northern-ireland';

  -- England cities
  INSERT INTO public.cities (name, slug, state_id, country, is_active) VALUES
    ('London', 'london', england_id, 'GB', true),
    ('Birmingham', 'birmingham', england_id, 'GB', true),
    ('Manchester', 'manchester', england_id, 'GB', true),
    ('Leeds', 'leeds', england_id, 'GB', true),
    ('Liverpool', 'liverpool', england_id, 'GB', true),
    ('Bristol', 'bristol', england_id, 'GB', true),
    ('Sheffield', 'sheffield', england_id, 'GB', true),
    ('Newcastle', 'newcastle', england_id, 'GB', true),
    ('Nottingham', 'nottingham', england_id, 'GB', true),
    ('Leicester', 'leicester', england_id, 'GB', true),
    ('Coventry', 'coventry', england_id, 'GB', true),
    ('Bradford', 'bradford', england_id, 'GB', true),
    ('Southampton', 'southampton', england_id, 'GB', true),
    ('Brighton', 'brighton', england_id, 'GB', true),
    ('Plymouth', 'plymouth', england_id, 'GB', true),
    ('Reading', 'reading', england_id, 'GB', true),
    ('Derby', 'derby', england_id, 'GB', true),
    ('Oxford', 'oxford', england_id, 'GB', true),
    ('Cambridge', 'cambridge', england_id, 'GB', true),
    ('Norwich', 'norwich', england_id, 'GB', true),
    ('Wolverhampton', 'wolverhampton', england_id, 'GB', true),
    ('Stoke-on-Trent', 'stoke-on-trent', england_id, 'GB', true),
    ('Sunderland', 'sunderland', england_id, 'GB', true),
    ('Milton Keynes', 'milton-keynes', england_id, 'GB', true),
    ('Northampton', 'northampton', england_id, 'GB', true),
    ('Luton', 'luton', england_id, 'GB', true),
    ('Peterborough', 'peterborough', england_id, 'GB', true),
    ('Bournemouth', 'bournemouth', england_id, 'GB', true),
    ('Swindon', 'swindon', england_id, 'GB', true),
    ('York', 'york', england_id, 'GB', true),
    ('Exeter', 'exeter', england_id, 'GB', true),
    ('Ipswich', 'ipswich', england_id, 'GB', true),
    ('Gloucester', 'gloucester', england_id, 'GB', true),
    ('Bath', 'bath', england_id, 'GB', true),
    ('Cheltenham', 'cheltenham', england_id, 'GB', true),
    ('Chester', 'chester', england_id, 'GB', true),
    ('Lincoln', 'lincoln', england_id, 'GB', true),
    ('Blackpool', 'blackpool', england_id, 'GB', true),
    ('Preston', 'preston', england_id, 'GB', true),
    ('Hull', 'hull', england_id, 'GB', true)
  ON CONFLICT (slug) DO NOTHING;

  -- Scotland cities
  INSERT INTO public.cities (name, slug, state_id, country, is_active) VALUES
    ('Edinburgh', 'edinburgh', scotland_id, 'GB', true),
    ('Glasgow', 'glasgow', scotland_id, 'GB', true),
    ('Aberdeen', 'aberdeen', scotland_id, 'GB', true),
    ('Dundee', 'dundee', scotland_id, 'GB', true),
    ('Inverness', 'inverness', scotland_id, 'GB', true)
  ON CONFLICT (slug) DO NOTHING;

  -- Wales cities
  INSERT INTO public.cities (name, slug, state_id, country, is_active) VALUES
    ('Cardiff', 'cardiff', wales_id, 'GB', true),
    ('Swansea', 'swansea', wales_id, 'GB', true),
    ('Newport', 'newport', wales_id, 'GB', true),
    ('Wrexham', 'wrexham', wales_id, 'GB', true)
  ON CONFLICT (slug) DO NOTHING;

  -- Northern Ireland cities
  INSERT INTO public.cities (name, slug, state_id, country, is_active) VALUES
    ('Belfast', 'belfast', ni_id, 'GB', true),
    ('Derry', 'derry', ni_id, 'GB', true),
    ('Lisburn', 'lisburn', ni_id, 'GB', true),
    ('Newry', 'newry', ni_id, 'GB', true)
  ON CONFLICT (slug) DO NOTHING;
END $$;


-- ============================================================================
-- SECTION 8: INSERT GLOBAL SETTINGS (Platform Config)
-- ============================================================================

INSERT INTO public.global_settings (key, value) VALUES
  ('platform', '{"site_name": "Foster Connect", "site_url": "https://www.fosterconnect.co.uk", "tagline": "UK Fostering Agency Directory"}'::jsonb),
  ('contact_details', '{"city": "London", "state": "England", "country": "United Kingdom", "support_email": "support@fosterconnect.co.uk", "support_phone": "+44 20 1234 5678"}'::jsonb),
  ('social_links', '{"twitter": "https://twitter.com/fosterconnect", "facebook": "https://facebook.com/fosterconnect", "instagram": "https://instagram.com/fosterconnect", "linkedin": "https://linkedin.com/company/fosterconnect"}'::jsonb),
  ('footer_config', '{"show_trust_badges": true, "show_ofsted_badge": true, "copyright_text": "© 2026 Foster Connect. All rights reserved."}'::jsonb),
  ('branding', '{"primary_color": "#2563eb", "logo_text": "Foster Connect", "brand_description": "The UK''s most trusted fostering agency directory"}'::jsonb),
  ('legal', '{"company_name": "Foster Connect Ltd", "company_number": "", "vat_number": "", "registered_address": "London, United Kingdom"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


-- ============================================================================
-- SECTION 9: INSERT SUBSCRIPTION PLANS (For Agency Listings)
-- ============================================================================

INSERT INTO public.subscription_plans (name, slug, description, price_aed, price_monthly, price_yearly, display_order, is_active, features) VALUES
  ('Free', 'free', 'Basic agency listing', 0, 0, 0, 1, true, '{"max_photos": 3, "featured_listing": false, "review_management": false, "analytics": false}'::jsonb),
  ('Professional', 'professional', 'Enhanced visibility and tools', 0, 49, 490, 2, true, '{"max_photos": 20, "featured_listing": true, "review_management": true, "analytics": true, "lead_notifications": true}'::jsonb),
  ('Premium', 'premium', 'Maximum exposure and priority support', 0, 99, 990, 3, true, '{"max_photos": 50, "featured_listing": true, "review_management": true, "analytics": true, "lead_notifications": true, "priority_support": true, "competitor_insights": true}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  is_active = true;


-- ============================================================================
-- SECTION 10: INSERT ROLE PRESETS
-- ============================================================================

INSERT INTO public.role_presets (name, role, description, permissions, is_system, is_default) VALUES
  ('Super Admin', 'super_admin', 'Full platform access', '{"all": true}'::jsonb, true, false),
  ('Agency Owner', 'clinic_owner', 'Manages their own agency profile', '{"manage_profile": true, "view_analytics": true, "manage_reviews": true, "manage_bookings": true}'::jsonb, true, false),
  ('Content Editor', 'editor', 'Can edit content across the platform', '{"manage_content": true, "manage_blog": true, "manage_seo": true}'::jsonb, true, false),
  ('Viewer', 'viewer', 'Read-only access', '{"view_only": true}'::jsonb, true, true)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- SECTION 11: INSERT EMAIL TEMPLATES
-- ============================================================================

INSERT INTO public.email_templates (name, slug, subject, html_content, category, is_active) VALUES
  ('Welcome Email', 'welcome', 'Welcome to Foster Connect!', '<h1>Welcome to Foster Connect</h1><p>Thank you for joining the UK''s most trusted fostering agency directory.</p>', 'onboarding', true),
  ('Agency Claim Request', 'claim-request', 'New Agency Claim Request', '<h1>New Claim Request</h1><p>A new claim request has been submitted for {{agency_name}}.</p>', 'admin', true),
  ('Review Request', 'review-request', 'Share Your Fostering Experience', '<h1>How was your experience?</h1><p>We''d love to hear about your experience with {{agency_name}}.</p>', 'reviews', true),
  ('Agency Approved', 'agency-approved', 'Your Agency Has Been Verified!', '<h1>Congratulations!</h1><p>Your agency {{agency_name}} has been verified on Foster Connect.</p>', 'notifications', true)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  is_active = true;


-- ============================================================================
-- SECTION 12: INSERT BLOG CATEGORIES
-- ============================================================================

INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Fostering Guides', 'fostering-guides', 'Step-by-step guides on how to become a foster carer'),
  ('Carer Stories', 'carer-stories', 'Real stories from foster carers across the UK'),
  ('Regulations & Policy', 'regulations-policy', 'Ofsted updates, legislation changes, and policy guidance'),
  ('Training & Development', 'training-development', 'Training resources and professional development for carers'),
  ('Child Wellbeing', 'child-wellbeing', 'Supporting the emotional and physical wellbeing of children in care'),
  ('Financial Guidance', 'financial-guidance', 'Fostering allowances, tax guidance, and financial planning'),
  ('Agency News', 'agency-news', 'News and updates from fostering agencies')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;


-- ============================================================================
-- SECTION 13: INSERT BLOG AUTHORS
-- ============================================================================

INSERT INTO public.blog_authors (name, slug, bio, role) VALUES
  ('Foster Connect Editorial', 'foster-connect-editorial', 'The Foster Connect editorial team brings together experienced social workers, foster carers, and child welfare experts to create comprehensive, accurate content.', 'editor'),
  ('Guest Contributor', 'guest-contributor', 'Expert contributions from social workers, foster carers, and child welfare professionals across the UK.', 'contributor')
ON CONFLICT (slug) DO UPDATE SET
  bio = EXCLUDED.bio;


-- ============================================================================
-- SECTION 14: INSERT COUNTRIES
-- ============================================================================

INSERT INTO public.countries (name, code, is_active) VALUES
  ('United Kingdom', 'GB', true)
ON CONFLICT (code) DO UPDATE SET is_active = true;


-- ============================================================================
-- SECTION 15: INSERT SUPPORTED LANGUAGES
-- ============================================================================

INSERT INTO public.supported_languages (code, name, native_name, is_active, is_rtl, display_order) VALUES
  ('en', 'English', 'English', true, false, 1),
  ('cy', 'Welsh', 'Cymraeg', true, false, 2),
  ('gd', 'Scottish Gaelic', 'Gàidhlig', false, false, 3)
ON CONFLICT (code) DO UPDATE SET is_active = EXCLUDED.is_active;


-- ============================================================================
-- SECTION 16: INSERT CMS PAGE CONTENT FOR KEY PAGES
-- ============================================================================

INSERT INTO public.page_content (page_slug, page_type, title, h1, meta_title, meta_description, hero_subtitle, hero_intro, is_published) VALUES
  ('/', 'home', 'Foster Connect – UK Fostering Agency Directory', 'Find Trusted Fostering Agencies Near You', 'Foster Connect | UK Fostering Agency Directory', 'Compare Ofsted-rated fostering agencies across the UK. Read carer reviews, check ratings, and start your fostering journey today.', 'The UK''s Most Trusted Fostering Directory', 'Whether you''re considering becoming a foster carer or looking for the right agency, Foster Connect helps you compare Ofsted-rated agencies, read genuine carer reviews, and take the first step.', true),
  ('/about', 'static', 'About Foster Connect', 'About Foster Connect', 'About Us | Foster Connect', 'Learn about Foster Connect''s mission to connect foster carers with the right agencies across England, Scotland, Wales, and Northern Ireland.', NULL, 'Foster Connect is the UK''s leading independent fostering agency directory, helping prospective carers find and compare agencies based on Ofsted ratings, carer reviews, and specialist services.', true),
  ('/contact', 'static', 'Contact Us', 'Contact Foster Connect', 'Contact Us | Foster Connect', 'Get in touch with the Foster Connect team for support, partnership enquiries, or agency listing questions.', NULL, 'We''re here to help. Whether you have questions about fostering, want to list your agency, or need support, our team is ready to assist.', true),
  ('/faq', 'static', 'Frequently Asked Questions', 'Fostering FAQ', 'Fostering FAQ | Foster Connect', 'Answers to common questions about fostering in the UK including eligibility, allowances, the assessment process, and more.', NULL, 'Find answers to the most frequently asked questions about fostering in the UK.', true),
  ('/how-it-works', 'static', 'How It Works', 'How Foster Connect Works', 'How It Works | Foster Connect', 'Discover how Foster Connect helps you compare fostering agencies, read reviews, and start your fostering journey.', NULL, 'Foster Connect makes it simple to find and compare fostering agencies across the UK in three easy steps.', true),
  ('/pricing', 'static', 'Pricing', 'Agency Pricing Plans', 'Pricing for Agencies | Foster Connect', 'View Foster Connect pricing plans for fostering agencies looking to increase visibility and attract foster carers.', NULL, 'Choose the plan that''s right for your agency. From free basic listings to premium visibility packages.', true),
  ('/blog', 'blog', 'Fostering Blog', 'Foster Connect Blog', 'Fostering Blog | Foster Connect', 'Expert articles, carer stories, and guidance on fostering in the UK from the Foster Connect team.', NULL, 'Stay informed with the latest fostering news, carer stories, and expert guidance.', true),
  ('/services', 'static', 'Fostering Services', 'Types of Fostering', 'Fostering Types & Services | Foster Connect', 'Explore different types of fostering including emergency, respite, therapeutic, long-term, and short-term fostering.', NULL, 'Discover the different types of fostering available across the UK and find the right path for you.', true),
  ('/privacy', 'static', 'Privacy Policy', 'Privacy Policy', 'Privacy Policy | Foster Connect', 'How Foster Connect handles your personal data and protects your privacy.', NULL, NULL, true),
  ('/terms', 'static', 'Terms of Service', 'Terms of Service', 'Terms of Service | Foster Connect', 'Foster Connect terms and conditions for platform users and listed agencies.', NULL, NULL, true)
ON CONFLICT (page_slug) DO UPDATE SET
  title = EXCLUDED.title,
  h1 = EXCLUDED.h1,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  hero_subtitle = EXCLUDED.hero_subtitle,
  hero_intro = EXCLUDED.hero_intro,
  is_published = true,
  updated_at = now();


-- ============================================================================
-- SECTION 17: INSERT FEATURE REGISTRY
-- ============================================================================

INSERT INTO public.feature_registry (feature_key, name, description, category, display_order) VALUES
  ('agency_profiles', 'Agency Profiles', 'Agency profile pages with Ofsted ratings', 'core', 1),
  ('carer_reviews', 'Carer Reviews', 'Foster carer review and rating system', 'core', 2),
  ('content_studio', 'Content Studio', 'AI-powered content generation', 'admin', 3),
  ('faq_studio', 'FAQ Studio', 'AI-powered FAQ generation', 'admin', 4),
  ('seo_tools', 'SEO Tools', 'SEO audit and optimisation tools', 'admin', 5),
  ('blog', 'Blog', 'Blog publishing system', 'content', 6),
  ('lead_management', 'Lead Management', 'Enquiry and lead tracking', 'business', 7),
  ('reputation_management', 'Reputation Management', 'Review monitoring and response', 'business', 8),
  ('analytics', 'Analytics', 'Visitor and performance analytics', 'business', 9),
  ('booking', 'Enquiry Booking', 'Appointment and consultation booking', 'business', 10)
ON CONFLICT (feature_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;


-- ============================================================================
-- SECTION 18: RLS POLICIES FOR KEY TABLES (if missing)
-- ============================================================================

-- Ensure basic read access on public-facing tables
DO $$
BEGIN
  -- states
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'states' AND policyname = 'Anyone can read states') THEN
    CREATE POLICY "Anyone can read states" ON public.states FOR SELECT USING (true);
  END IF;

  -- cities
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cities' AND policyname = 'Anyone can read cities') THEN
    CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT USING (true);
  END IF;

  -- treatments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'treatments' AND policyname = 'Anyone can read treatments') THEN
    CREATE POLICY "Anyone can read treatments" ON public.treatments FOR SELECT USING (true);
  END IF;

  -- clinics (agencies)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinics' AND policyname = 'Anyone can read clinics') THEN
    CREATE POLICY "Anyone can read clinics" ON public.clinics FOR SELECT USING (true);
  END IF;

  -- seo_pages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_pages' AND policyname = 'Anyone can read seo_pages') THEN
    CREATE POLICY "Anyone can read seo_pages" ON public.seo_pages FOR SELECT USING (true);
  END IF;

  -- global_settings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'global_settings' AND policyname = 'Anyone can read global_settings') THEN
    CREATE POLICY "Anyone can read global_settings" ON public.global_settings FOR SELECT USING (true);
  END IF;

  -- page_content
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Anyone can read page_content') THEN
    CREATE POLICY "Anyone can read page_content" ON public.page_content FOR SELECT USING (true);
  END IF;

  -- blog_posts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Anyone can read blog_posts') THEN
    CREATE POLICY "Anyone can read blog_posts" ON public.blog_posts FOR SELECT USING (true);
  END IF;

  -- blog_categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_categories' AND policyname = 'Anyone can read blog_categories') THEN
    CREATE POLICY "Anyone can read blog_categories" ON public.blog_categories FOR SELECT USING (true);
  END IF;

  -- subscription_plans
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Anyone can read subscription_plans') THEN
    CREATE POLICY "Anyone can read subscription_plans" ON public.subscription_plans FOR SELECT USING (true);
  END IF;
END $$;


-- ============================================================================
-- SECTION 19: ADMIN WRITE POLICIES (for authenticated users with admin role)
-- ============================================================================

-- Service role bypass is automatic, but for admin dashboard access via client:
DO $$
BEGIN
  -- seo_pages admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_pages' AND policyname = 'Admins can manage seo_pages') THEN
    CREATE POLICY "Admins can manage seo_pages"
      ON public.seo_pages FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;

  -- treatments admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'treatments' AND policyname = 'Admins can manage treatments') THEN
    CREATE POLICY "Admins can manage treatments"
      ON public.treatments FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;

  -- page_content admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Admins can manage page_content') THEN
    CREATE POLICY "Admins can manage page_content"
      ON public.page_content FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;

  -- clinics admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinics' AND policyname = 'Admins can manage clinics') THEN
    CREATE POLICY "Admins can manage clinics"
      ON public.clinics FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ============================================================================
-- SECTION 20: CREATE has_role() FUNCTION FOR SECURE ROLE CHECKING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


-- ============================================================================
-- SECTION 21: VERIFY SETUP — Run this to check everything is in place
-- ============================================================================

-- Count check (run separately to verify)
-- SELECT 'states' AS table_name, COUNT(*) FROM states WHERE is_active = true
-- UNION ALL SELECT 'cities', COUNT(*) FROM cities WHERE is_active = true
-- UNION ALL SELECT 'treatments', COUNT(*) FROM treatments WHERE is_active = true
-- UNION ALL SELECT 'global_settings', COUNT(*) FROM global_settings
-- UNION ALL SELECT 'page_content', COUNT(*) FROM page_content
-- UNION ALL SELECT 'seo_pages', COUNT(*) FROM seo_pages
-- UNION ALL SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
-- UNION ALL SELECT 'blog_categories', COUNT(*) FROM blog_categories
-- UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates
-- UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
-- UNION ALL SELECT 'section_content', COUNT(*) FROM section_content;

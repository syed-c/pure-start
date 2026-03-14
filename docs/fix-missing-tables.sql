-- ============================================================================
-- FIX MISSING TABLES & COLUMNS
-- Run this FIRST in Supabase SQL Editor, THEN run database-setup-commands.sql
-- ============================================================================

-- 1. supported_languages (never created in migrations)
CREATE TABLE IF NOT EXISTS public.supported_languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT,
  is_active BOOLEAN DEFAULT true,
  is_rtl BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supported_languages' AND policyname = 'Anyone can read supported_languages') THEN
    CREATE POLICY "Anyone can read supported_languages" ON public.supported_languages FOR SELECT USING (true);
  END IF;
END $$;

-- 2. subscription_plans — add price_monthly if missing
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_monthly NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_yearly NUMERIC(10,2) DEFAULT 0;

-- 3. role_presets — add is_system if missing
ALTER TABLE public.role_presets ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- 4. Verify all tables exist (run this after to check)
SELECT 'subscription_plans' AS tbl, COUNT(*) FROM subscription_plans
UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates
UNION ALL SELECT 'blog_categories', COUNT(*) FROM blog_categories
UNION ALL SELECT 'blog_authors', COUNT(*) FROM blog_authors
UNION ALL SELECT 'countries', COUNT(*) FROM countries
UNION ALL SELECT 'supported_languages', COUNT(*) FROM supported_languages
UNION ALL SELECT 'page_content', COUNT(*) FROM page_content
UNION ALL SELECT 'feature_registry', COUNT(*) FROM feature_registry
UNION ALL SELECT 'role_presets', COUNT(*) FROM role_presets
UNION ALL SELECT 'states', COUNT(*) FROM states
UNION ALL SELECT 'cities', COUNT(*) FROM cities
UNION ALL SELECT 'treatments', COUNT(*) FROM treatments
UNION ALL SELECT 'seo_pages', COUNT(*) FROM seo_pages
UNION ALL SELECT 'global_settings', COUNT(*) FROM global_settings
UNION ALL SELECT 'section_content', COUNT(*) FROM section_content
UNION ALL SELECT 'reputation_alerts', COUNT(*) FROM reputation_alerts
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles;

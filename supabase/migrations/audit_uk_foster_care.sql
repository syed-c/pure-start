-- ============================================================
-- UK FOSTER CARE PLATFORM - DATABASE CLEANUP & AUDIT
-- Run this to verify and clean the database for UK Foster Care
-- ============================================================

-- 1. CHECK CURRENT STATE
-- =====================

-- List all tables
SELECT 
  '=== TABLES ===' as info,
  table_name as "Table Name",
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as "Total Tables"
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. AGENCIES TABLE - UK Foster Care
-- ================================
-- Check agencies table exists and structure
SELECT '=== AGENCIES TABLE ===' as info;

-- 3. STATES/REGIONS - UK MARKET
-- ============================
SELECT 
  '=== UK REGIONS ===' as info,
  name as "Region Name",
  slug as "Slug",
  abbreviation as "Abbreviation"
FROM public.states
ORDER BY name;

-- 4. CITIES - UK MARKET
-- ===================
SELECT 
  '=== UK CITIES ===' as info,
  c.name as "City Name",
  c.slug as "Slug",
  s.name as "Region"
FROM public.cities c
JOIN public.states s ON c.state_id = s.id
ORDER BY s.name, c.name;

-- 5. AGENCIES COUNT
-- ===============
SELECT 
  '=== AGENCIES ===' as info,
  COUNT(*) as "Total Agencies"
FROM public.agencies;

-- 6. SEO PAGES - UK FOSTER CARE CONTENT
-- =====================================
SELECT 
  '=== SEO PAGES ===' as info,
  page_type as "Type",
  COUNT(*) as "Count"
FROM public.seo_pages
GROUP BY page_type
ORDER BY page_type;

-- 7. CLEANUP - REMOVE ANY DENTAL/DUBAI REFERENCES
-- =============================================
-- Note: This is informational only, do not delete old data
-- The system should just use agencies, states, cities, seo_pages tables
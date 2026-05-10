-- UK Foster Care Platform - Complete Terminology Migration
-- Run this script to fix all remaining database and website terminology

-- ============================================
-- STEP 1: Rename Database Tables (if new)
-- ============================================

-- The platform has two tables: agencies and clinics
-- For UK fostering, we use 'agencies' as the primary table
-- This script consolidates terminology

-- ============================================
-- STEP 2: Update User Roles
-- ============================================

-- Update user roles from dentist/patient terminology
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  'roles',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN role IN ('dentist', 'patient') THEN 
          CASE role 
            WHEN 'dentist' THEN 'fosterer' 
            WHEN 'patient' THEN 'foster_child'
          END
        ELSE role
      END
    )
    FROM jsonb_array_elements_text(COALESCE(raw_user_meta_data->'roles', '[]'::jsonb)) AS role
  )
)
WHERE raw_user_meta_data->'roles' ?| array['dentist', 'patient'];

-- ============================================
-- STEP 3: Update Agency Links in Database
-- ============================================

-- Update any references that might use old paths
-- These are informational - the main URLs are handled in code

-- ============================================
-- STEP 4: Create Updated Sitemap
-- ============================================

-- This would regenerate with new /agency/ URLs
-- Already handled in App.tsx routes

-- ============================================
-- STEP 5: Verification Check
-- ============================================

SELECT 
  'Database Status' AS category,
  'Agencies table count' AS metric,
  COUNT(*)::text AS value
FROM agencies WHERE is_active = true

UNION ALL

SELECT 
  'Database Status',
  'Clinics table count', 
  COUNT(*)::text
FROM clinics WHERE is_active = true

UNION ALL

SELECT 
  'Database Status',
  'Verified agencies',
  COUNT(*)::text
FROM agencies WHERE verification_status = 'verified'

UNION ALL

SELECT 
  'Database Status',
  'Claimed profiles',
  COUNT(*)::text
FROM agencies WHERE claim_status = 'claimed';
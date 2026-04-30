-- Comprehensive SEO Pages Setup for Foster Care UK
-- Run this in Supabase SQL Editor to create all pages

-- First, make sure seo_pages table exists and RLS is disabled
ALTER TABLE IF EXISTS public.seo_pages DISABLE ROW LEVEL SECURITY;

-- Insert pages for ALL ACTIVE REGIONS (states)
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
SELECT 
    slug,
    'region' as page_type,
    'Fostering Agencies in ' || name as title,
    'Fostering Agencies in ' || name as h1,
    true as is_indexed,
    true as is_thin_content,
    true as needs_optimization,
    NOW() as updated_at
FROM public.states 
WHERE is_active = true
ON CONFLICT (slug) DO NOTHING;

-- Insert pages for ALL CITIES
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
SELECT 
    s.slug || '/' || c.slug as slug,
    'city' as page_type,
    'Fostering Agencies in ' || c.name || ', ' || s.name as title,
    'Fostering Agencies in ' || c.name || ', ' || s.name as h1,
    true as is_indexed,
    true as is_thin_content,
    true as needs_optimization,
    NOW() as updated_at
FROM public.cities c
JOIN public.states s ON c.state_id = s.id
WHERE c.is_active = true AND s.is_active = true
ON CONFLICT (slug) DO NOTHING;

-- Insert pages for ALL TREATMENTS/CATEGORIES
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
SELECT 
    slug,
    'category' as page_type,
    name || ' – Fostering Services' as title,
    name as h1,
    true as is_indexed,
    true as is_thin_content,
    true as needs_optimization,
    NOW() as updated_at
FROM public.treatments 
WHERE is_active = true
ON CONFLICT (slug) DO NOTHING;

-- Insert pages for SERVICE+LOCATION combinations (city + treatment)
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
SELECT 
    s.slug || '/' || c.slug || '/' || t.slug as slug,
    'city_category' as page_type,
    t.name || ' in ' || c.name || ', ' || s.name as title,
    t.name || ' in ' || c.name as h1,
    true as is_indexed,
    true as is_thin_content,
    true as needs_optimization,
    NOW() as updated_at
FROM public.cities c
JOIN public.states s ON c.state_id = s.id
CROSS JOIN public.treatments t
WHERE c.is_active = true AND s.is_active = true AND t.is_active = true
ON CONFLICT (slug) DO NOTHING;

-- Insert static pages
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
VALUES 
    ('/', 'static', 'Foster Care – UK Fostering Agency Directory', 'Find Trusted Fostering Agencies Near You', true, true, true, NOW()),
    ('about', 'static', 'About Foster Care', 'About Foster Care', true, true, true, NOW()),
    ('faq', 'static', 'Frequently Asked Questions', 'Fostering FAQ', true, true, true, NOW()),
    ('how-it-works', 'static', 'How Foster Care Works', 'How It Works', true, true, true, NOW()),
    ('contact', 'static', 'Contact Foster Care', 'Contact Us', true, true, true, NOW()),
    ('privacy', 'static', 'Privacy Policy', 'Privacy Policy', true, true, true, NOW()),
    ('terms', 'static', 'Terms of Service', 'Terms of Service', true, true, true, NOW()),
    ('services', 'static', 'Fostering Services & Types', 'Fostering Services & Types', true, true, true, NOW()),
    ('blog', 'static', 'Fostering Blog', 'Foster Care Blog', true, true, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify the count
SELECT page_type, COUNT(*) as count FROM public.seo_pages GROUP BY page_type;
SELECT COUNT(*) as total_pages FROM public.seo_pages;

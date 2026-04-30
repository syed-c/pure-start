-- Populate seo_pages for Foster Care UK from frontend constants
-- Run this in Supabase SQL Editor

-- Ensure RLS is permissive for admin operations
ALTER TABLE IF EXISTS public.seo_pages DISABLE ROW LEVEL SECURITY;

-- Clear existing pages (optional - comment out if you want to keep existing)
-- DELETE FROM public.seo_pages WHERE true;

-- Insert regions (ACTIVE_REGIONS)
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
VALUES 
    ('england', 'region', 'Fostering Agencies in England', 'Fostering Agencies in England', true, true, true, NOW()),
    ('scotland', 'region', 'Fostering Agencies in Scotland', 'Fostering Agencies in Scotland', true, true, true, NOW()),
    ('wales', 'region', 'Fostering Agencies in Wales', 'Fostering Agencies in Wales', true, true, true, NOW()),
    ('northern-ireland', 'region', 'Fostering Agencies in Northern Ireland', 'Fostering Agencies in Northern Ireland', true, true, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert categories (FOSTERING_CATEGORIES)
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
VALUES 
    ('independent-fostering-agency', 'category', 'Independent Fostering Agencies', 'Independent Fostering Agencies', true, true, true, NOW()),
    ('local-authority-fostering', 'category', 'Local Authority Fostering', 'Local Authority Fostering', true, true, true, NOW()),
    ('emergency-fostering', 'category', 'Emergency Fostering', 'Emergency Fostering', true, true, true, NOW()),
    ('respite-fostering', 'category', 'Respite Fostering', 'Respite Fostering', true, true, true, NOW()),
    ('parent-and-child-fostering', 'category', 'Parent & Child Fostering', 'Parent & Child Fostering', true, true, true, NOW()),
    ('therapeutic-fostering', 'category', 'Therapeutic Fostering', 'Therapeutic Fostering', true, true, true, NOW()),
    ('long-term-fostering', 'category', 'Long-Term Fostering', 'Long-Term Fostering', true, true, true, NOW()),
    ('short-term-fostering', 'category', 'Short-Term Fostering', 'Short-Term Fostering', true, true, true, NOW()),
    ('disability-complex-needs-fostering', 'category', 'Disability & Complex Needs Fostering', 'Disability & Complex Needs Fostering', true, true, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert cities (POPULAR_CITIES with region prefix)
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
VALUES 
    ('england/london', 'city', 'Fostering Agencies in London', 'Fostering Agencies in London', true, true, true, NOW()),
    ('england/birmingham', 'city', 'Fostering Agencies in Birmingham', 'Fostering Agencies in Birmingham', true, true, true, NOW()),
    ('england/manchester', 'city', 'Fostering Agencies in Manchester', 'Fostering Agencies in Manchester', true, true, true, NOW()),
    ('england/leeds', 'city', 'Fostering Agencies in Leeds', 'Fostering Agencies in Leeds', true, true, true, NOW()),
    ('england/liverpool', 'city', 'Fostering Agencies in Liverpool', 'Fostering Agencies in Liverpool', true, true, true, NOW()),
    ('england/bristol', 'city', 'Fostering Agencies in Bristol', 'Fostering Agencies in Bristol', true, true, true, NOW()),
    ('england/sheffield', 'city', 'Fostering Agencies in Sheffield', 'Fostering Agencies in Sheffield', true, true, true, NOW()),
    ('england/newcastle', 'city', 'Fostering Agencies in Newcastle', 'Fostering Agencies in Newcastle', true, true, true, NOW()),
    ('england/nottingham', 'city', 'Fostering Agencies in Nottingham', 'Fostering Agencies in Nottingham', true, true, true, NOW()),
    ('england/southampton', 'city', 'Fostering Agencies in Southampton', 'Fostering Agencies in Southampton', true, true, true, NOW()),
    ('england/oxford', 'city', 'Fostering Agencies in Oxford', 'Fostering Agencies in Oxford', true, true, true, NOW()),
    ('england/cambridge', 'city', 'Fostering Agencies in Cambridge', 'Fostering Agencies in Cambridge', true, true, true, NOW()),
    ('england/brighton', 'city', 'Fostering Agencies in Brighton', 'Fostering Agencies in Brighton', true, true, true, NOW()),
    ('england/leicester', 'city', 'Fostering Agencies in Leicester', 'Fostering Agencies in Leicester', true, true, true, NOW()),
    ('england/coventry', 'city', 'Fostering Agencies in Coventry', 'Fostering Agencies in Coventry', true, true, true, NOW()),
    ('england/plymouth', 'city', 'Fostering Agencies in Plymouth', 'Fostering Agencies in Plymouth', true, true, true, NOW()),
    ('england/reading', 'city', 'Fostering Agencies in Reading', 'Fostering Agencies in Reading', true, true, true, NOW()),
    ('england/norwich', 'city', 'Fostering Agencies in Norwich', 'Fostering Agencies in Norwich', true, true, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert service locations (region/city/category combinations)
-- For each city and category combination
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
SELECT 
    r.slug || '/' || c.slug || '/' || cat.slug as slug,
    'city_category' as page_type,
    cat.name || ' in ' || c.name || ', ' || r.name as title,
    cat.name || ' in ' || c.name as h1,
    true as is_indexed,
    true as is_thin_content,
    true as needs_optimization,
    NOW() as updated_at
FROM (VALUES 
    ('england', 'England'),
    ('scotland', 'Scotland'),
    ('wales', 'Wales'),
    ('northern-ireland', 'Northern Ireland')
) AS r(slug, name)
CROSS JOIN (VALUES 
    ('london', 'London'),
    ('birmingham', 'Birmingham'),
    ('manchester', 'Manchester'),
    ('leeds', 'Leeds'),
    ('liverpool', 'Liverpool'),
    ('bristol', 'Bristol'),
    ('sheffield', 'Sheffield'),
    ('newcastle', 'Newcastle'),
    ('nottingham', 'Nottingham'),
    ('southampton', 'Southampton'),
    ('oxford', 'Oxford'),
    ('cambridge', 'Cambridge'),
    ('brighton', 'Brighton'),
    ('leicester', 'Leicester'),
    ('coventry', 'Coventry'),
    ('plymouth', 'Plymouth'),
    ('reading', 'Reading'),
    ('norwich', 'Norwich')
) AS c(slug, name)
CROSS JOIN (VALUES 
    ('independent-fostering-agency', 'Independent Fostering Agency'),
    ('local-authority-fostering', 'Local Authority Fostering'),
    ('emergency-fostering', 'Emergency Fostering'),
    ('respite-fostering', 'Respite Fostering'),
    ('parent-and-child-fostering', 'Parent & Child Fostering'),
    ('therapeutic-fostering', 'Therapeutic Fostering'),
    ('long-term-fostering', 'Long-Term Fostering'),
    ('short-term-fostering', 'Short-Term Fostering'),
    ('disability-complex-needs-fostering', 'Disability & Complex Needs Fostering')
) AS cat(slug, name)
WHERE r.slug = 'england'  -- Only for England for now
ON CONFLICT (slug) DO NOTHING;

-- Insert static pages
INSERT INTO public.seo_pages (slug, page_type, title, h1, is_indexed, is_thin_content, needs_optimization, updated_at)
VALUES 
    ('/', 'static', 'Foster Care – UK Fostering Agency Directory', 'Find Trusted Fostering Agencies', true, true, true, NOW()),
    ('about', 'static', 'About Us', 'About Foster Care', true, true, true, NOW()),
    ('faq', 'static', 'FAQ', 'Frequently Asked Questions', true, true, true, NOW()),
    ('how-it-works', 'static', 'How It Works', 'How Foster Care Works', true, true, true, NOW()),
    ('contact', 'static', 'Contact Us', 'Contact Us', true, true, true, NOW()),
    ('privacy', 'static', 'Privacy Policy', 'Privacy Policy', true, true, true, NOW()),
    ('terms', 'static', 'Terms of Service', 'Terms of Service', true, true, true, NOW()),
    ('services', 'static', 'Services', 'Fostering Services', true, true, true, NOW()),
    ('blog', 'static', 'Blog', 'Foster Care Blog', true, true, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify counts
SELECT page_type, COUNT(*) as count FROM public.seo_pages GROUP BY page_type ORDER BY page_type;
SELECT COUNT(*) as total_pages FROM public.seo_pages;

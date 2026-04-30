-- Make seo_pages table fully permissive for development
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read seo_pages" ON public.seo_pages;
DROP POLICY IF EXISTS "Authenticated users can manage seo_pages" ON public.seo_pages;
DROP POLICY IF EXISTS "Admin all seo_pages" ON public.seo_pages;

-- Create permissive policies for all operations
CREATE POLICY "Anyone can do anything with seo_pages" ON public.seo_pages
FOR ALL
USING (true)
WITH CHECK (true);

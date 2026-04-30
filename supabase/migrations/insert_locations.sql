-- Simplified database setup
-- Run this in Supabase SQL Editor

-- Insert UK regions first (states already exists)
INSERT INTO public.states (name, slug, abbreviation, is_active) VALUES
  ('England', 'england', 'EN', true),
  ('Scotland', 'scotland', 'SC', true),
  ('Wales', 'wales', 'WA', true),
  ('Northern Ireland', 'northern-ireland', 'NI', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert cities for England
INSERT INTO public.cities (name, slug, state_id, is_active) VALUES 
  ('London', 'london', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Birmingham', 'birmingham', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Manchester', 'manchester', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Leeds', 'leeds', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Liverpool', 'liverpool', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Bristol', 'bristol', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Sheffield', 'sheffield', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Newcastle', 'newcastle', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Nottingham', 'nottingham', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Southampton', 'southampton', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Oxford', 'oxford', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Cambridge', 'cambridge', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true),
  ('Brighton', 'brighton', (SELECT id FROM public.states WHERE slug = 'england' LIMIT 1), true)
ON CONFLICT (slug, state_id) DO NOTHING;

-- Insert cities for Scotland
INSERT INTO public.cities (name, slug, state_id, is_active) VALUES 
  ('Edinburgh', 'edinburgh', (SELECT id FROM public.states WHERE slug = 'scotland' LIMIT 1), true),
  ('Glasgow', 'glasgow', (SELECT id FROM public.states WHERE slug = 'scotland' LIMIT 1), true)
ON CONFLICT (slug, state_id) DO NOTHING;

-- Insert cities for Wales
INSERT INTO public.cities (name, slug, state_id, is_active) VALUES 
  ('Cardiff', 'cardiff', (SELECT id FROM public.states WHERE slug = 'wales' LIMIT 1), true)
ON CONFLICT (slug, state_id) DO NOTHING;

-- Insert cities for Northern Ireland
INSERT INTO public.cities (name, slug, state_id, is_active) VALUES 
  ('Belfast', 'belfast', (SELECT id FROM public.states WHERE slug = 'northern-ireland' LIMIT 1), true)
ON CONFLICT (slug, state_id) DO NOTHING;

-- Verify
SELECT 'States:' as info, COUNT(*) as count FROM public.states
UNION ALL SELECT 'Cities:', COUNT(*) FROM public.cities
UNION ALL SELECT 'Clinics:', COUNT(*) FROM public.clinics;
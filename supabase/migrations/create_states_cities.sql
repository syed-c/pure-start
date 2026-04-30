-- Create states and cities tables
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abbreviation TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id UUID REFERENCES public.states(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(slug, state_id)
);

-- Enable RLS
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Anyone read cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Service full states" ON public.states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full cities" ON public.cities FOR ALL USING (true) WITH CHECK (true);

-- Insert UK regions
INSERT INTO public.states (name, slug, abbreviation, is_active) VALUES
  ('England', 'england', 'EN', true),
  ('Scotland', 'scotland', 'SC', true),
  ('Wales', 'wales', 'WA', true),
  ('Northern Ireland', 'northern-ireland', 'NI', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert major UK cities
INSERT INTO public.cities (name, slug, state_id, is_active) 
SELECT 'London', 'london', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Birmingham', 'birmingham', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Manchester', 'manchester', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Leeds', 'leeds', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Liverpool', 'liverpool', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Bristol', 'bristol', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Sheffield', 'sheffield', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Newcastle', 'newcastle', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Nottingham', 'nottingham', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Southampton', 'southampton', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Oxford', 'oxford', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Cambridge', 'cambridge', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Brighton', 'brighton', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Leicester', 'leicester', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Coventry', 'coventry', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Bradford', 'bradford', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Stoke-on-Trent', 'stoke-on-trent', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Wolverhampton', 'wolverhampton', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Plymouth', 'plymouth', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Reading', 'reading', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Derby', 'derby', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Kingston upon Hull', 'kingston-upon-hull', id, true FROM public.states WHERE slug = 'england'
UNION ALL SELECT 'Edinburgh', 'edinburgh', id, true FROM public.states WHERE slug = 'scotland'
UNION ALL SELECT 'Glasgow', 'glasgow', id, true FROM public.states WHERE slug = 'scotland'
UNION ALL SELECT 'Aberdeen', 'aberdeen', id, true FROM public.states WHERE slug = 'scotland'
UNION ALL SELECT 'Dundee', 'dundee', id, true FROM public.states WHERE slug = 'scotland'
UNION ALL SELECT 'Cardiff', 'cardiff', id, true FROM public.states WHERE slug = 'wales'
UNION ALL SELECT 'Swansea', 'swansea', id, true FROM public.states WHERE slug = 'wales'
UNION ALL SELECT 'Belfast', 'belfast', id, true FROM public.states WHERE slug = 'northern-ireland'
ON CONFLICT (slug, state_id) DO NOTHING;
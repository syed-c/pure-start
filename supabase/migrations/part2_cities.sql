-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id UUID REFERENCES public.states(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(slug, state_id)
);
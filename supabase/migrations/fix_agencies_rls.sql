-- Fix agencies table RLS for edge function access
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read agencies" ON public.agencies;
DROP POLICY IF EXISTS "Anyone can insert agencies" ON public.agencies;
DROP POLICY IF EXISTS "Anyone can update agencies" ON public.agencies;

-- Create new policies allowing service role access
CREATE POLICY "Anyone can read agencies" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Service can insert agencies" ON public.agencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update agencies" ON public.agencies FOR UPDATE USING (true);
CREATE POLICY "Service can do everything agencies" ON public.agencies FOR ALL USING (true) WITH CHECK (true);
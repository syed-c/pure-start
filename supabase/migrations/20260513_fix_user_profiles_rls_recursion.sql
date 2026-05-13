-- Fix RLS infinite recursion on user_profiles table
-- The existing policies recursively query user_profiles within themselves,
-- causing a 500 error (stack overflow) when any authenticated user tries
-- to read their own profile.
--
-- Fix: Replace recursive policies with non-recursive alternatives
-- that use auth.jwt() instead of self-referencing subqueries.

-- Drop recursive SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view organisation users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for anon" ON public.user_profiles;

-- Create a simple, non-recursive SELECT policy for authenticated users
CREATE POLICY "user_profiles_select"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- For anon users (needed for auth callback flows)
CREATE POLICY "user_profiles_select_anon"
  ON public.user_profiles
  FOR SELECT
  TO anon
  USING (true);

-- Drop recursive management policies
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Agency admins can manage org users" ON public.user_profiles;

-- Create a non-recursive management policy using auth.jwt() role
CREATE POLICY "user_profiles_manage"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (auth.jwt()->>'role' = 'super_admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (auth.jwt()->>'role' = 'super_admin')
  );

-- Create the missing tables referenced by code (to fix 404 errors)

-- user_tab_permissions - stores granular tab access for non-admin users
CREATE TABLE IF NOT EXISTS public.user_tab_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tab_key text NOT NULL DEFAULT '',
  is_enabled boolean DEFAULT true,
  can_access boolean DEFAULT true,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.user_tab_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_tab_permissions_admin" ON public.user_tab_permissions;
CREATE POLICY "user_tab_permissions_admin"
  ON public.user_tab_permissions
  FOR ALL
  USING (auth.jwt()->>'role' = 'super_admin');

DROP POLICY IF EXISTS "user_tab_permissions_read" ON public.user_tab_permissions;
CREATE POLICY "user_tab_permissions_read"
  ON public.user_tab_permissions
  FOR SELECT
  USING (true);

-- booking_notifications - real-time booking notifications
CREATE TABLE IF NOT EXISTS public.booking_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  agency_id uuid,
  title text NOT NULL DEFAULT '',
  message text,
  notification_type text DEFAULT 'booking',
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_notifications_select" ON public.booking_notifications;
CREATE POLICY "booking_notifications_select"
  ON public.booking_notifications
  FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'super_admin');

-- platform_notifications - system-wide notifications
CREATE TABLE IF NOT EXISTS public.platform_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  role text,
  title text NOT NULL DEFAULT '',
  message text,
  notification_type text DEFAULT 'system',
  is_dismissed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_notifications_select" ON public.platform_notifications;
CREATE POLICY "platform_notifications_select"
  ON public.platform_notifications
  FOR SELECT
  USING (user_id = auth.uid() OR (user_id IS NULL AND role IS NULL) OR auth.jwt()->>'role' = 'super_admin');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON public.user_tab_permissions TO authenticated, anon;
GRANT SELECT ON public.booking_notifications TO authenticated, anon;
GRANT SELECT ON public.platform_notifications TO authenticated, anon;

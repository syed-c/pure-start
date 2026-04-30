-- Create function to get user profile bypassing RLS
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS SETOF user_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM user_profiles WHERE user_id = get_user_profile.user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO anon;

-- Allow anon and authenticated to call this function
CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for anon" ON user_profiles FOR SELECT
  TO anon
  USING (true);
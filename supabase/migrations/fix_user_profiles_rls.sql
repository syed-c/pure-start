-- Fix RLS policies to allow users to read their own profile
-- Disable RLS temporarily, fix policies, re-enable

-- First, disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create a permissive policy that allows authenticated users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create policy for inserting own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT * FROM user_profiles WHERE email = 'adilahmadip@gmail.com';
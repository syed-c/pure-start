-- Run this in Supabase SQL Editor to create super admin

-- First check if user exists in auth
SELECT id, email FROM auth.users WHERE email = 'adilahmadip@gmail.com';

-- Create or update user profile with super_admin role
INSERT INTO user_profiles (user_id, email, full_name, role, status)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'super_admin', 'active'
FROM auth.users 
WHERE email = 'adilahmadip@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', status = 'active';

-- Verify
SELECT * FROM user_profiles WHERE email = 'adilahmadip@gmail.com';
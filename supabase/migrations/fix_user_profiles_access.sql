-- First, let's see if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'adilahmadip@gmail.com';

-- Check if profile already exists
SELECT * FROM user_profiles WHERE email = 'adilahmadip@gmail.com';

-- If no profile exists, create one (replace with actual user_id from above query)
-- UPDATE this with the actual user_id from auth.users
INSERT INTO user_profiles (user_id, email, full_name, role, status)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'super_admin', 'active'
FROM auth.users 
WHERE email = 'adilahmadip@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', status = 'active';

-- Verify the result
SELECT * FROM user_profiles WHERE email = 'adilahmadip@gmail.com';
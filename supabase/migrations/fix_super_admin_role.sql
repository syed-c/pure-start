-- Fix super admin role
UPDATE user_profiles 
SET role = 'super_admin', status = 'active'
WHERE email = 'adilahmadip@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, status FROM user_profiles WHERE email = 'adilahmadip@gmail.com';
-- Check users with admin roles
SELECT id, email, role, status 
FROM user_profiles 
WHERE role IN ('super_admin', 'agency_admin', 'agency_staff', 'trainer', 'auditor')
ORDER BY role, email;

-- Check if any users exist
SELECT COUNT(*) as total, role FROM user_profiles GROUP BY role;
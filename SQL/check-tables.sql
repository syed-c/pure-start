-- Check all tables and their counts
SELECT 'agencies' as table_name, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'foster_carer_profiles', COUNT(*) FROM foster_carer_profiles
UNION ALL  
SELECT 'applicant_profiles', COUNT(*) FROM applicant_profiles
UNION ALL
SELECT 'enquiries', COUNT(*) FROM enquiries
UNION ALL
SELECT 'trainer_profiles', COUNT(*) FROM trainer_profiles
UNION ALL
SELECT 'fostering_enquiries', COUNT(*) FROM fostering_enquiries
UNION ALL
SELECT 'visitor_sessions', COUNT(*) FROM visitor_sessions
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;
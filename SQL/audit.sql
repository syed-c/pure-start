-- Quick audit of database
SELECT 'agencies' as table_name, COUNT(*) as count FROM agencies WHERE is_duplicate = false
UNION ALL
SELECT 'cities', COUNT(*) FROM cities WHERE is_active = true
UNION ALL
SELECT 'states', COUNT(*) FROM states WHERE is_active = true
UNION ALL
SELECT 'categories', COUNT(*) FROM fostering_categories WHERE is_active = true;
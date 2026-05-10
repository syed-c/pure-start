-- Check all cities with England state_id
SELECT name, slug, state_id, is_active 
FROM cities 
WHERE state_id = '389e1c08-af73-438f-98b9-07a6af29068a' AND is_active = true
ORDER BY name;

-- Check agencies in Oxford/Cambridge
SELECT name, city, place_id 
FROM agencies 
WHERE city ILIKE '%Oxford%' OR city ILIKE '%Cambridge%' OR city ILIKE '%Brighton%';

-- Count total agencies
SELECT COUNT(*) as total FROM agencies WHERE is_duplicate = false;
-- Check if cities were added
SELECT name, slug, state_id FROM cities 
WHERE name IN ('Oxford', 'Cambridge', 'Brighton', 'Reading', 'Bournemouth')
ORDER BY name;
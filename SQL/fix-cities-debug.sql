-- Debug: Check city state_ids and is_active
SELECT name, slug, state_id, is_active FROM cities 
WHERE name IN ('Oxford', 'Cambridge', 'Brighton', 'Reading', 'Bournemouth');

-- Fix: Ensure they are active and linked to England
UPDATE cities SET 
  state_id = '389e1c08-af73-438f-98b9-07a6af29068a',
  is_active = true
WHERE name IN ('Oxford', 'Cambridge', 'Brighton', 'Reading', 'Bournemouth');

-- Verify the fix
SELECT name, slug, state_id, is_active FROM cities 
WHERE name IN ('Oxford', 'Cambridge', 'Brighton', 'Reading', 'Bournemouth');

-- Check all England cities now
SELECT name, slug FROM cities 
WHERE state_id = '389e1c08-af73-438f-98b9-07a6af29068a' AND is_active = true
ORDER BY name LIMIT 20;
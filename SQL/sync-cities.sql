-- =====================================================
-- SYNC CITIES FOR UK FOSTERING AGENCY DIRECTORY
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- First, get England state ID (adjust if needed)
DO $$
DECLARE
  england_state_id UUID;
BEGIN
  -- Get or create England state
  SELECT id INTO england_state_id 
  FROM states 
  WHERE slug = 'england' 
  LIMIT 1;
  
  IF england_state_id IS NULL THEN
    INSERT INTO states (name, slug, abbreviation, is_active)
    VALUES ('England', 'england', 'ENG', true)
    RETURNING id INTO england_state_id;
  END IF;
  
  RAISE NOTICE 'England State ID: %', england_state_id;
  
  -- Insert missing cities from POPULAR_CITIES config
  INSERT INTO cities (name, slug, state_id, is_active)
  SELECT 
    city.name,
    city.slug,
    england_state_id,
    true
  FROM (VALUES
    ('London', 'london'),
    ('Birmingham', 'birmingham'),
    ('Manchester', 'manchester'),
    ('Leeds', 'leeds'),
    ('Liverpool', 'liverpool'),
    ('Bristol', 'bristol'),
    ('Sheffield', 'sheffield'),
    ('Newcastle', 'newcastle'),
    ('Nottingham', 'nottingham'),
    ('Southampton', 'southampton'),
    ('Oxford', 'oxford'),
    ('Cambridge', 'cambridge'),
    ('Brighton', 'brighton'),
    ('Leicester', 'leicester'),
    ('Coventry', 'coventry'),
    ('Plymouth', 'plymouth'),
    ('Reading', 'reading'),
    ('Norwich', 'norwich'),
    ('Derby', 'derby'),
    ('Hull', 'hull'),
    ('Portsmouth', 'portsmouth'),
    ('Luton', 'luton'),
    ('Milton Keynes', 'milton-keynes'),
    ('Wolverhampton', 'wolverhampton'),
    ('Sunderland', 'sunderland'),
    ('Walsall', 'walsall'),
    ('Oldham', 'oldham'),
    ('Wigan', 'wigan'),
    ('Stoke-on-Trent', 'stoke-on-trent'),
    ('Warrington', 'warrington'),
    ('Bradford', 'bradford'),
    ('Stoke', 'stoke'),
    ('York', 'york'),
    ('Swansea', 'swansea'),
    ('Bournemouth', 'bournemouth'),
    ('Southend', 'southend'),
    ('Swindon', 'swindon'),
    ('Salford', 'salford'),
    ('Manchester', 'manchester'),
    ('Preston', 'preston'),
    ('Royal Leamington Spa', 'royal-leamington-spa'),
    ('Watford', 'watford'),
    ('Edinburgh', 'edinburgh'),
    ('Glasgow', 'glasgow'),
    ('Cardiff', 'cardiff'),
    ('Belfast', 'belfast'),
    ('Exeter', 'exeter'),
    ('Chelmsford', 'chelmsford'),
    ('Maidstone', 'maidstone'),
    ('Colchester', 'colchester')
  ) AS city(name, slug)
  WHERE NOT EXISTS (
    SELECT 1 FROM cities WHERE slug = city.slug
  );
  
  RAISE NOTICE 'Cities sync complete!';
END $$;

-- Verify results
SELECT 'Cities in database:' as info, COUNT(*) as total FROM cities WHERE is_active = true;
SELECT 'Sample cities:' as info, name, slug FROM cities WHERE is_active = true ORDER BY name LIMIT 20;
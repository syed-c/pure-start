-- =====================================================
-- ADD MISSING CITIES TO DATABASE
-- Run in Supabase SQL Editor
-- =====================================================

-- Add Oxford, Cambridge, Brighton, Reading, Bournemouth
INSERT INTO cities (name, slug, state_id, is_active)
SELECT name, slug, state_id, true
FROM (VALUES
  ('Oxford', 'oxford'),
  ('Cambridge', 'cambridge'),
  ('Brighton', 'brighton'),
  ('Reading', 'reading'),
  ('Bournemouth', 'bournemouth'),
  ('Cheltenham', 'cheltenham'),
  ('Guildford', 'guildford'),
  ('Basingstoke', 'basingstoke'),
  ('Maidenhead', 'maidenhead'),
  ('Windsor', 'windsor'),
  ('Bath', 'bath'),
  ('Hatfield', 'hatfield'),
  ('Welwyn Garden City', 'welwyn-garden-city'),
  ('Dartford', 'dartford'),
  ('Gravesend', 'gravesend'),
  ('Tonbridge', 'tonbridge'),
  ('Tunbridge Wells', 'tunbridge-wells'),
  ('Bromley', 'bromley'),
  ('Croydon', 'croydon'),
  ('Sutton', 'sutton'),
  ('Kingston upon Thames', 'kingston-upon-thames'),
  ('Richmond', 'richmond'),
  ('Hounslow', 'hounslow'),
  ('Harrow', 'harrow'),
  ('Enfield', 'enfield'),
  ('Barnet', 'barnet')
) AS city(name, slug)
CROSS JOIN (SELECT id FROM states WHERE slug = 'england' LIMIT 1) AS state(state_id)
WHERE NOT EXISTS (
  SELECT 1 FROM cities WHERE cities.slug = city.slug
);

-- Verify
SELECT name, slug FROM cities ORDER BY name LIMIT 50;
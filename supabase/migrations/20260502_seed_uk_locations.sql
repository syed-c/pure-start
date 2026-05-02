-- UK Regions and Cities for Fostering Platform

-- Insert UK Regions (States) - only if states table has correct structure
INSERT INTO states (name, slug, country, is_active) VALUES
('England', 'england', 'UK', true),
('Scotland', 'scotland', 'UK', true),
('Wales', 'wales', 'UK', true),
('Northern Ireland', 'northern-ireland', 'UK', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Major UK Cities with Fostering Market Focus
INSERT INTO cities (name, slug, state_id, population, is_active) VALUES
-- Greater London
('London', 'london', (SELECT id FROM states WHERE slug = 'england'), 8982000, true),
-- West Midlands
('Birmingham', 'birmingham', (SELECT id FROM states WHERE slug = 'england'), 1141816, true),
('Coventry', 'coventry', (SELECT id FROM states WHERE slug = 'england'), 371480, true),
('Wolverhampton', 'wolverhampton', (SELECT id FROM states WHERE slug = 'england'), 262448, true),
('Walsall', 'walsall', (SELECT id FROM states WHERE slug = 'england'), 266347, true),
-- Greater Manchester
('Manchester', 'manchester', (SELECT id FROM states WHERE slug = 'england'), 547627, true),
('Salford', 'salford', (SELECT id FROM states WHERE slug = 'england'), 103813, true),
(' Bolton', 'bolton', (SELECT id FROM states WHERE slug = 'england'), 141853, true),
-- Merseyside
('Liverpool', 'liverpool', (SELECT id FROM states WHERE slug = 'england'), 494814, true),
('Wirral', 'wirral', (SELECT id FROM states WHERE slug = 'england'), 327286, true),
-- West Yorkshire
('Leeds', 'leeds', (SELECT id FROM states WHERE slug = 'england'), 537800, true),
('Bradford', 'bradford', (SELECT id FROM states WHERE slug = 'england'), 537800, true),
('Wakefield', 'wakefield', (SELECT id FROM states WHERE slug = 'england'), 345591, true),
-- South Yorkshire
('Sheffield', 'sheffield', (SELECT id FROM states WHERE slug = 'england'), 584853, true),
('Doncaster', 'doncaster', (SELECT id FROM states WHERE slug = 'england'), 302403, true),
-- Tyne and Wear
('Newcastle', 'newcastle', (SELECT id FROM states WHERE slug = 'england'), 300196, true),
('Sunderland', 'sunderland', (SELECT id FROM states WHERE slug = 'england'), 277964, true),
-- Bristol
('Bristol', 'bristol', (SELECT id FROM states WHERE slug = 'england'), 463377, true),
-- Leicester
('Leicester', 'leicester', (SELECT id FROM states WHERE slug = 'england'), 354036, true),
-- Nottingham
('Nottingham', 'nottingham', (SELECT id FROM states WHERE slug = 'england'), 311400, true),
-- Scotland
('Edinburgh', 'edinburgh', (SELECT id FROM states WHERE slug = 'scotland'), 524930, true),
('Glasgow', 'glasgow', (SELECT id FROM states WHERE slug = 'scotland'), 635640, true),
-- Wales
('Cardiff', 'cardiff', (SELECT id FROM states WHERE slug = 'wales'), 362756, true),
('Swansea', 'swansea', (SELECT id FROM states WHERE slug = 'wales'), 239022, true),
-- Northern Ireland
('Belfast', 'belfast', (SELECT id FROM states WHERE slug = 'northern-ireland'), 333871, true)
ON CONFLICT (slug) DO NOTHING;
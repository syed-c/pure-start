-- UK Cities for Fostering Platform (simplified)
INSERT INTO cities (name, slug, is_active) VALUES
-- England
('London', 'london', true),
('Birmingham', 'birmingham', true),
('Manchester', 'manchester', true),
('Leeds', 'leeds', true),
('Liverpool', 'liverpool', true),
('Sheffield', 'sheffield', true),
('Bristol', 'bristol', true),
('Newcastle', 'newcastle', true),
('Nottingham', 'nottingham', true),
('Leicester', 'leicester', true),
('Edinburgh', 'edinburgh', true),
('Glasgow', 'glasgow', true),
('Cardiff', 'cardiff', true),
('Belfast', 'belfast', true)
ON CONFLICT (slug) DO NOTHING;
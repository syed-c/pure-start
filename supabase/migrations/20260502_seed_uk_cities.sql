-- Add more UK cities for fostering platform (simplified)
INSERT INTO cities (name, slug, is_active) VALUES
-- England - Greater London
('London', 'london', true),
('Croydon', 'croydon', true),
('Bromley', 'bromley', true),
('Ealing', 'ealing', true),
-- England - West Midlands
('Birmingham', 'birmingham', true),
('Coventry', 'coventry', true),
('Wolverhampton', 'wolverhampton', true),
('Walsall', 'walsall', true),
('Dudley', 'dudley', true),
('Sandwell', 'sandwell', true),
-- England - Greater Manchester
('Manchester', 'manchester', true),
('Salford', 'salford', true),
('Bury', 'bury', true),
('Oldham', 'oldham', true),
('Rochdale', 'rochdale', true),
('Trafford', 'trafford', true),
-- England - Merseyside
('Liverpool', 'liverpool', true),
('Wirral', 'wirral', true),
('Sefton', 'sefton', true),
-- England - West Yorkshire
('Leeds', 'leeds', true),
('Bradford', 'bradford', true),
('Wakefield', 'wakefield', true),
('Kirklees', 'kirklees', true),
('Calderdale', 'calderdale', true),
-- England - South Yorkshire
('Sheffield', 'sheffield', true),
('Doncaster', 'doncaster', true),
('Rotherham', 'rotherham', true),
('Barnsley', 'barnsley', true),
-- England - Tyne and Wear
('Newcastle', 'newcastle', true),
('Sunderland', 'sunderland', true),
('Gateshead', 'gateshead', true),
-- England - Bristol area
('Bristol', 'bristol', true),
-- England - East Midlands
('Leicester', 'leicester', true),
('Nottingham', 'nottingham', true),
('Derby', 'derby', true),
-- England - Hampshire
('Southampton', 'southampton', true),
('Portsmouth', 'portsmouth', true),
-- England - Kent
('Maidstone', 'maidstone', true),
('Medway', 'medway', true),
('Canterbury', 'canterbury', true),
-- England - Sussex
('Brighton', 'brighton', true),
('Worthing', 'worthing', true),
-- England - Essex
('Chelmsford', 'chelmsford', true),
('Colchester', 'colchester', true),
('Southend', 'southend', true),
-- Scotland
('Glasgow', 'glasgow', true),
('Edinburgh', 'edinburgh', true),
('Aberdeen', 'aberdeen', true),
('Dundee', 'dundee', true),
-- Wales
('Cardiff', 'cardiff', true),
('Swansea', 'swansea', true),
('Newport', 'newport', true),
('Wrexham', 'wrexham', true),
-- Northern Ireland
('Belfast', 'belfast', true),
('Derry', 'derry', true),
('Newry', 'newry', true)
ON CONFLICT (slug) DO NOTHING;
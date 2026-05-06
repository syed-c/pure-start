-- UK States and Cities Database Setup
-- Run this in Supabase SQL Editor

-- Insert UK Regions/States
INSERT INTO states (name, abbreviation, country) VALUES
('England', 'ENG', 'GB'),
('Scotland', 'SCT', 'GB'),
('Wales', 'WLS', 'GB'),
('Northern Ireland', 'NIR', 'GB')
ON CONFLICT DO NOTHING;

-- Insert England Cities
INSERT INTO cities (name, slug, state_id, county, latitude, longitude) VALUES
-- Greater London
('London', 'london', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater London', 51.5074, -0.1278),
('Bromley', 'bromley', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater London', 51.4039, 0.0198),
('Croydon', 'croydon', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater London', 51.3762, -0.0922),
('Barnet', 'barnet', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater London', 51.6252, -0.1517),
('Southwark', 'southwark', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater London', 51.5035, -0.0804),
-- West Midlands
('Birmingham', 'birmingham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Midlands', 52.4862, -1.8904),
('Coventry', 'coventry', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Midlands', 52.4068, -1.5197),
('Wolverhampton', 'wolverhampton', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Midlands', 52.5912, -2.1246),
(' Dudley', 'dudley', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Midlands', 52.5089, -2.0893),
('Solihull', 'solihull', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Midlands', 52.4121, -1.7803),
-- Greater Manchester
('Manchester', 'manchester', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.4808, -2.2426),
(' Bolton', 'bolton', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.5769, -2.4180),
('Stockport', 'stockport', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.4102, -2.1575),
('Oldham', 'oldham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.5412, -2.1181),
('Rochdale', 'rochdale', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.5550, -2.1638),
-- West Yorkshire
('Leeds', 'leeds', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Yorkshire', 53.7960, -1.5414),
('Bradford', 'bradford', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Yorkshire', 53.7939, -1.6131),
('Wakefield', 'wakefield', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Yorkshire', 53.6840, -1.5039),
('Huddersfield', 'huddersfield', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Yorkshire', 53.6421, -1.7897),
('Halifax', 'halifax', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Yorkshire', 53.7251, -1.8625),
-- South Yorkshire
('Sheffield', 'sheffield', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'South Yorkshire', 53.3811, -1.4701),
('Doncaster', 'doncaster', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'South Yorkshire', 53.5230, -1.1339),
('Rotherham', 'rotherham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'South Yorkshire', 53.4263, -1.3570),
('Barnsley', 'barnsley', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'South Yorkshire', 53.5500, -1.3500),
-- Merseyside
('Liverpool', 'liverpool', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Merseyside', 53.4084, -2.9916),
('Wirral', 'wirral', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Merseyside', 53.3723, -3.0740),
('Southport', 'southport', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Merseyside', 53.6448, -3.0060),
('St Helens', 'st-helens', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Merseyside', 53.4832, -2.7448),
('Bootle', 'bootle', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Merseyside', 53.4368, -2.9822),
-- Hampshire
('Southampton', 'southampton', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Hampshire', 50.9097, -1.4044),
('Portsmouth', 'portsmouth', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Hampshire', 50.8198, -1.0879),
('Basingstoke', 'basingstoke', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Hampshire', 51.2665, -1.0911),
('Andover', 'andover', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Hampshire', 51.2075, -1.4790),
('Farnborough', 'farnborough', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Hampshire', 51.2967, -0.7475),
-- Kent
('Maidstone', 'maidstone', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Kent', 51.2665, 0.5223),
('Rochester', 'rochester', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Kent', 51.3815, 0.5014),
('Chatham', 'chatham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Kent', 51.3823, 0.5261),
('Gillingham', 'gillingham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Kent', 51.3883, 0.5488),
('Dover', 'dover', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Kent', 51.1292, 1.3070),
-- Essex
('Colchester', 'colchester', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Essex', 51.8892, 0.9042),
('Chelmsford', 'chelmsford', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Essex', 51.7357, 0.4694),
('Southend', 'southend', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Essex', 51.5459, 0.7072),
('Basildon', 'basildon', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Essex', 51.5451, 0.4878),
('Grays', 'grays', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Essex', 51.4766, 0.3210),
-- Surrey
('Guildford', 'guildford', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Surrey', 51.2365, -0.5694),
('Woking', 'woking', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Surrey', 51.3179, -0.5640),
('Epsom', 'epsom', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Surrey', 51.3306, -0.2522),
('Redhill', 'redhill', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Surrey', 51.2570, -0.1680),
('Farnham', 'farnham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Surrey', 51.1944, -0.7936),
-- Lancashire
('Blackpool', 'blackpool', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Lancashire', 53.8175, -3.0500),
('Preston', 'preston', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Lancashire', 53.7596, -2.3153),
('Lancaster', 'lancaster', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Lancashire', 54.0475, -2.8013),
('Burnley', 'burnley', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Lancashire', 53.7891, -2.2456),
('Accrington', 'accrington', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Lancashire', 53.7538, -2.3560),
-- Devon
('Exeter', 'exeter', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Devon', 50.7216, -3.5266),
('Plymouth', 'plymouth', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Devon', 50.3711, -4.1426),
('Torquay', 'torquay', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Devon', 50.4777, -3.5193),
('Exmouth', 'exmouth', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Devon', 50.6181, -3.4144),
('Brixham', 'brixham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Devon', 50.3911, -3.5128),
-- Norfolk
('Norwich', 'norwich', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Norfolk', 52.6291, 1.2974),
('Great Yarmouth', 'great-yarmouth', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Norfolk', 52.6112, 1.7370),
('King\'s Lynn', 'kings-lynn', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Norfolk', 52.7519, 0.4319),
('Dereham', 'dereham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Norfolk', 52.6835, 0.9380),
-- Oxfordshire
('Oxford', 'oxford', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Oxfordshire', 51.7545, -1.2540),
('Banbury', 'banbury', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Oxfordshire', 52.0629, -1.3328),
('Abingdon', 'abingdon', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Oxfordshire', 51.6761, -1.2821),
('Didcot', 'didcot', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Oxfordshire', 51.6101, -1.2327),
-- Nottinghamshire
('Nottingham', 'nottingham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Nottinghamshire', 52.9533, -1.1485),
('Mansfield', 'mansfield', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Nottinghamshire', 53.1450, -1.1975),
('Newark', 'newark', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Nottinghamshire', 53.0733, -0.7976),
('Sutton', 'sutton', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Nottinghamshire', 53.1000, -1.3000),
-- Bristol
('Bristol', 'bristol', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Bristol', 51.4545, -2.5879),
-- Tyne and Wear
('Newcastle', 'newcastle', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Tyne and Wear', 54.9783, -1.5791),
('Sunderland', 'sunderland', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Tyne and Wear', 54.9063, -1.3817),
('Gateshead', 'gateshead', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Tyne and Wear', 54.9625, -1.6018),
('South Shields', 'south-shields', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Tyne and Wear', 55.0041, -1.4335),
-- Additional cities
('Reading', 'reading', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Berkshire', 51.4549, -0.9691),
('Milton Keynes', 'milton-keynes', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Buckinghamshire', 52.0412, -0.7556),
('Derby', 'derby', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Derbyshire', 52.9221, -1.4743),
('Leicester', 'leicester', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Leicestershire', 52.6386, -1.1394),
('York', 'york', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'North Yorkshire', 53.9590, -1.0815),
('Cambridge', 'cambridge', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Cambridgeshire', 52.2053, 0.1218),
('Brighton', 'brighton', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'East Sussex', 50.8225, -0.1372),
('Hull', 'hull', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'East Riding of Yorkshire', 53.7677, -0.3271),
('Warrington', 'warrington', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Cheshire', 53.3926, -2.5920),
('Stoke-on-Trent', 'stoke-on-trent', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Staffordshire', 53.0027, -2.1794),
('Salford', 'salford', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.4875, -2.2907),
('Wigan', 'wigan', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.5420, -2.5176),
('Walsall', 'walsall', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'West Midlands', 52.5854, -1.9879),
('Oldham', 'oldham', (SELECT id FROM states WHERE abbreviation = 'ENG'), 'Greater Manchester', 53.5412, -2.1181)
ON CONFLICT DO NOTHING;

-- Insert Scotland Cities
INSERT INTO cities (name, slug, state_id, county, latitude, longitude) VALUES
('Glasgow', 'glasgow', (SELECT id FROM states WHERE abbreviation = 'SCT'), 'Glasgow City', 55.8642, -4.2518),
('Edinburgh', 'edinburgh', (SELECT id FROM states WHERE abbreviation = 'SCT'), 'City of Edinburgh', 55.9533, -3.1883),
('Aberdeen', 'aberdeen', (SELECT id FROM states WHERE abbreviation = 'SCT'), 'Aberdeen City', 57.1497, -2.0923),
('Dundee', 'dundee', (SELECT id FROM states WHERE abbreviation = 'SCT'), 'Dundee City', 56.4621, -2.9707),
('Inverness', 'inverness', (SELECT id FROM states WHERE abbreviation = 'SCT'), 'Highland', 57.4778, -4.2240)
ON CONFLICT DO NOTHING;

-- Insert Wales Cities
INSERT INTO cities (name, slug, state_id, county, latitude, longitude) VALUES
('Cardiff', 'cardiff', (SELECT id FROM states WHERE abbreviation = 'WLS'), 'Cardiff', 51.4816, -3.1791),
('Swansea', 'swansea', (SELECT id FROM states WHERE abbreviation = 'WLS'), 'Swansea', 51.6277, -3.9381),
('Newport', 'newport', (SELECT id FROM states WHERE abbreviation = 'WLS'), 'Newport', 51.5879, -2.7955),
('Wrexham', 'wrexham', (SELECT id FROM states WHERE abbreviation = 'WLS'), 'Wrexham', 53.0466, -2.9974),
('Barry', 'barry', (SELECT id FROM states WHERE abbreviation = 'WLS'), 'Vale of Glamorgan', 51.4062, -3.2723)
ON CONFLICT DO NOTHING;

-- Insert Northern Ireland Cities
INSERT INTO cities (name, slug, state_id, county, latitude, longitude) VALUES
('Belfast', 'belfast', (SELECT id FROM states WHERE abbreviation = 'NIR'), 'Belfast', 54.5969, -5.9301),
('Derry', 'derry', (SELECT id FROM states WHERE abbreviation = 'NIR'), 'Derry and Strabane', 54.9971, -7.3093),
('Newry', 'newry', (SELECT id FROM states WHERE abbreviation = 'NIR'), 'Newry, Mourne and Down', 54.1766, -6.3383),
('Armagh', 'armagh', (SELECT id FROM states WHERE abbreviation = 'NIR'), 'Armagh, Banbridge and Craigavon', 54.3496, -6.6533),
('Lisburn', 'lisburn', (SELECT id FROM states WHERE abbreviation = 'NIR'), 'Lisburn and Castlereagh', 54.5022, -6.0505)
ON CONFLICT DO NOTHING;

-- Verify data
SELECT 'States:' as info, COUNT(*) as count FROM states;
SELECT 'Cities:' as info, COUNT(*) as count FROM cities;

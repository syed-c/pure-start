-- Add fostering-specific fields to agencies table

-- Agency type (independent vs local authority)
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_type TEXT DEFAULT 'independent';
COMMENT ON COLUMN agencies.agency_type IS 'Type of fostering agency: independent, local_authority, or combined';

-- Fostering types offered
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS fostering_types TEXT[] DEFAULT '{}';
COMMENT ON COLUMN agencies.fostering_types IS 'Types of fostering: short_term, long_term, emergency, parent_child, therapeutic, respite, sibling, teenage, disability';

-- Support features
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS has_24_7_support BOOLEAN DEFAULT false;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS training_provided BOOLEAN DEFAULT false;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS accepting_new_carers BOOLEAN DEFAULT true;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS accepting_referrals BOOLEAN DEFAULT true;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS online_enquiry BOOLEAN DEFAULT true;

-- Additional contact options
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_form_url TEXT;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS booking_url TEXT;

-- Allowances (optional display)
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS allowance_info TEXT;

-- Service regions
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS regions_served TEXT[];
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS counties_served TEXT[];

-- Agency details
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS staff_count INTEGER;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS approved_trainer BOOLEAN DEFAULT false;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS has_therapeutic_team BOOLEAN DEFAULT false;

-- Social proof
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS foster_carer_count INTEGER;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS child_placements_count INTEGER;

-- FAQ storage
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS faqs JSONB;

-- Update sample agencies with basic data
UPDATE agencies SET 
  agency_type = 'independent',
  fostering_types = ARRAY['short_term', 'long_term', 'respite'],
  has_24_7_support = true,
  training_provided = true,
  accepting_new_carers = true
WHERE agency_type IS NULL;

-- Add index for better filtering
CREATE INDEX IF NOT EXISTS idx_agencies_fostering_types ON agencies USING GIN(fostering_types);
CREATE INDEX IF NOT EXISTS idx_agencies_agency_type ON agencies(agency_type);
CREATE INDEX IF NOT EXISTS idx_agencies_accepting_new ON agencies(accepting_new_carers);
CREATE INDEX IF NOT EXISTS idx_agencies_location ON agencies(city, postcode);
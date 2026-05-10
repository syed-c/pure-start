-- Add agency_id to claim_requests table for UK Foster Care

-- Add agency_id column if it doesn't exist
ALTER TABLE claim_requests ADD COLUMN IF NOT EXISTS agency_id uuid;

-- Make agency_id reference agencies table
ALTER TABLE claim_requests ADD CONSTRAINT claim_requests_agency_id_fkey 
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE;

-- Add agency_id to unique constraint
-- First drop existing constraint if exists
ALTER TABLE claim_requests DROP CONSTRAINT IF EXISTS claim_requests_clinic_id_user_id_key;

-- Add new unique constraint (prefer agency_id over clinic_id)
ALTER TABLE claim_requests ADD CONSTRAINT claim_requests_agency_id_user_id_key 
  UNIQUE (agency_id, user_id);

-- Also keep clinic_id constraint for backwards compatibility
ALTER TABLE claim_requests ADD CONSTRAINT claim_requests_clinic_id_user_id_key 
  UNIQUE (clinic_id, user_id);

SELECT 'claim_requests table updated' AS status;